import { connectToDatabase } from '@/helpers/db-utils';
import { getSession } from 'next-auth/client';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const role = session.user.role || 'litigant';
  const userName = session.user.name || session.user.email;

  try {
    const client = await connectToDatabase();
    const db = client.db();

    if (req.method === 'GET') {
      // Fetch upcoming hearings within 7 days as alerts
      const today = new Date().toISOString().split('T')[0];
      const inSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const upcomingQuery = {
        hearing_date: { $gte: today, $lte: inSevenDays },
        status: { $in: ['Scheduled', 'Adjourned'] },
      };

      // Litigants see only their cases
      if (role === 'litigant') {
        upcomingQuery.registered_by = session.user.email;
      }
      // Magistrates see cases assigned to them
      if (role === 'magistrate') {
        upcomingQuery.assigned_magistrate = userName;
      }

      const upcomingCases = await db
        .collection('cases')
        .find(upcomingQuery)
        .toArray();

      // Fetch stored notifications
      const notifQuery = { $or: [{ for_role: 'all' }, { for_role: role }] };
      if (role === 'magistrate') {
        notifQuery.$or.push({ for_name: userName });
      }

      const stored = await db
        .collection('notifications')
        .find(notifQuery)
        .sort({ created_at: -1 })
        .limit(50)
        .toArray();

      client.close();

      return res.status(200).json({
        upcoming: upcomingCases.map((c) => ({
          case_number: c.case_number,
          case_type: c.case_type,
          hearing_date: c.hearing_date,
          hearing_time: c.hearing_time,
          uid: c.uid,
        })),
        notifications: stored,
      });
    }

    if (req.method === 'POST') {
      const { action, id } = req.body;

      if (action === 'mark-all-read') {
        await db.collection('notifications').updateMany(
          { $or: [{ for_role: 'all' }, { for_role: role }] },
          { $set: { read: true } }
        );
      } else if (action === 'mark-read' && id) {
        const { ObjectId } = await import('mongodb');
        await db.collection('notifications').updateOne(
          { _id: new ObjectId(id) },
          { $set: { read: true } }
        );
      }

      client.close();
      return res.status(200).json({ message: 'Updated' });
    }

    client.close();
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}
