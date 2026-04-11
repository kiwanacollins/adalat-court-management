import { connectToDatabase } from '@/helpers/db-utils';
import { getSession } from 'next-auth/client';

const EDITABLE_FIELDS = [
  'case_type', 'case_description',
  'complainant_name', 'complainant_contact',
  'respondent_name', 'respondent_contact',
  'assigned_magistrate', 'hearing_date', 'hearing_time', 'courtroom',
  'priority',
];

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ message: 'Method not allowed' });

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const role = session.user.role || 'litigant';
  if (role !== 'magistrate' && role !== 'clerk') {
    return res.status(403).json({ message: 'Only magistrates and clerks can edit cases' });
  }

  const { uid, ...rawUpdates } = req.body;
  if (!uid) return res.status(400).json({ message: 'uid is required' });

  // Allow only whitelisted fields
  const updates = {};
  for (const key of EDITABLE_FIELDS) {
    if (rawUpdates[key] !== undefined) updates[key] = rawUpdates[key];
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db();
    const result = await db.collection('cases').updateOne(
      { uid },
      { $set: updates }
    );
    client.close();

    if (result.matchedCount === 0) return res.status(404).json({ message: 'Case not found' });

    return res.status(200).json({ message: 'Case updated', updates });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}
