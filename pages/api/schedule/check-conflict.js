import { connectToDatabase } from '@/helpers/db-utils';
import { getSession } from 'next-auth/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const { hearing_date, hearing_time, assigned_magistrate, courtroom, exclude_uid } = req.body;

  if (!hearing_date || !hearing_time) {
    return res.status(200).json({ hasConflict: false });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db();

    const query = {
      hearing_date,
      hearing_time,
      status: { $nin: ['Concluded', 'Dismissed'] },
    };

    if (exclude_uid) query.uid = { $ne: exclude_uid };

    const conflicts = [];

    // Check magistrate conflict
    if (assigned_magistrate) {
      const magistrateConflict = await db.collection('cases').findOne({
        ...query,
        assigned_magistrate,
      });
      if (magistrateConflict) {
        conflicts.push(
          `Magistrate "${assigned_magistrate}" already has case ${magistrateConflict.case_number} scheduled at this time.`
        );
      }
    }

    // Check courtroom conflict
    if (courtroom) {
      const courtroomConflict = await db.collection('cases').findOne({
        ...query,
        courtroom,
      });
      if (courtroomConflict) {
        conflicts.push(
          `${courtroom} is already booked for case ${courtroomConflict.case_number} at this time.`
        );
      }
    }

    client.close();

    if (conflicts.length > 0) {
      return res.status(200).json({
        hasConflict: true,
        message: conflicts.join(' '),
        conflicts,
      });
    }

    return res.status(200).json({ hasConflict: false });
  } catch (error) {
    // If DB is unavailable, skip conflict check gracefully
    return res.status(200).json({ hasConflict: false });
  }
}
