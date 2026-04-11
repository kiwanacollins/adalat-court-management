import { connectToDatabase } from '@/helpers/db-utils';
import { getSession } from 'next-auth/client';

async function generateCaseNumber(db) {
  const year = new Date().getFullYear();
  const count = await db.collection('cases').countDocuments({
    case_number: { $regex: `^LGM/${year}/` },
  });
  return `LGM/${year}/${String(count + 1).padStart(3, '0')}`;
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const role = session.user.role || 'litigant';
  if (role !== 'magistrate' && role !== 'clerk') {
    return res.status(403).json({ message: 'Only clerks and magistrates can register cases' });
  }

  const {
    case_type,
    case_description,
    complainant_name,
    complainant_contact,
    respondent_name,
    respondent_contact,
    assigned_magistrate,
    hearing_date,
    hearing_time,
    courtroom,
    priority,
    uid,
    registered_by,
    filing_date,
    status,
    status_history,
  } = req.body;

  if (!case_type || !case_description || !complainant_name || !respondent_name) {
    return res.status(422).json({ message: 'Missing required fields' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db();

    const case_number = await generateCaseNumber(db);

    const newCase = {
      case_number,
      case_type,
      case_description,
      complainant_name,
      complainant_contact: complainant_contact || '',
      respondent_name,
      respondent_contact: respondent_contact || '',
      assigned_magistrate: assigned_magistrate || '',
      hearing_date: hearing_date || '',
      hearing_time: hearing_time || '',
      courtroom: courtroom || '',
      priority: priority || 'Normal',
      status: status || 'Pending',
      status_history: status_history || [],
      registered_by,
      filing_date,
      uid,
    };

    await db.collection('cases').insertOne(newCase);

    // Create notification for assigned magistrate if set
    if (assigned_magistrate && hearing_date) {
      await db.collection('notifications').insertOne({
        case_number,
        case_uid: uid,
        type: 'hearing_scheduled',
        message: `Case ${case_number} (${case_type}) has been scheduled. Hearing: ${hearing_date}${hearing_time ? ' at ' + hearing_time : ''}.`,
        for_role: 'magistrate',
        for_name: assigned_magistrate,
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    client.close();
    return res.status(201).json({ message: 'Case registered successfully', case_number });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export default handler;
