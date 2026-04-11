import { connectToDatabase } from '@/helpers/db-utils';
import { getSession } from 'next-auth/client';

const VALID_TRANSITIONS = {
  Pending: ['Scheduled', 'Dismissed'],
  Scheduled: ['Adjourned', 'Concluded', 'Dismissed'],
  Adjourned: ['Scheduled', 'Concluded', 'Dismissed'],
  Concluded: [],
  Dismissed: [],
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const role = session.user.role || 'litigant';
  if (role !== 'magistrate' && role !== 'clerk') {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }

  const { uid, new_status, note, hearing_date, hearing_time, courtroom, assigned_magistrate } = req.body;

  if (!uid || !new_status) {
    return res.status(422).json({ message: 'uid and new_status are required' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db();

    const existingCase = await db.collection('cases').findOne({ uid });
    if (!existingCase) {
      client.close();
      return res.status(404).json({ message: 'Case not found' });
    }

    const allowed = VALID_TRANSITIONS[existingCase.status] || [];
    if (!allowed.includes(new_status)) {
      client.close();
      return res.status(422).json({
        message: `Cannot transition from "${existingCase.status}" to "${new_status}"`,
      });
    }

    const historyEntry = {
      status: new_status,
      date: new Date().toISOString(),
      note: note || '',
      changed_by: session.user.email,
    };

    const updateFields = {
      status: new_status,
      $push: { status_history: historyEntry },
    };

    // Update hearing details if rescheduling
    if (hearing_date !== undefined) updateFields.hearing_date = hearing_date;
    if (hearing_time !== undefined) updateFields.hearing_time = hearing_time;
    if (courtroom !== undefined) updateFields.courtroom = courtroom;
    if (assigned_magistrate !== undefined) updateFields.assigned_magistrate = assigned_magistrate;

    await db.collection('cases').updateOne(
      { uid },
      {
        $set: {
          status: new_status,
          ...(hearing_date !== undefined && { hearing_date }),
          ...(hearing_time !== undefined && { hearing_time }),
          ...(courtroom !== undefined && { courtroom }),
          ...(assigned_magistrate !== undefined && { assigned_magistrate }),
        },
        $push: { status_history: historyEntry },
      }
    );

    // Create notification for relevant status changes
    if (['Scheduled', 'Adjourned'].includes(new_status)) {
      const notifMsg =
        new_status === 'Scheduled'
          ? `Case ${existingCase.case_number} has been scheduled. Hearing: ${hearing_date || existingCase.hearing_date}${hearing_time ? ' at ' + hearing_time : ''}.`
          : `Case ${existingCase.case_number} has been adjourned. ${note ? 'Reason: ' + note : ''} New date: ${hearing_date || 'TBD'}.`;

      await db.collection('notifications').insertOne({
        case_number: existingCase.case_number,
        case_uid: uid,
        type: new_status === 'Scheduled' ? 'hearing_scheduled' : 'hearing_adjourned',
        message: notifMsg,
        for_role: 'all',
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    client.close();
    return res.status(200).json({ message: `Case status updated to ${new_status}` });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
