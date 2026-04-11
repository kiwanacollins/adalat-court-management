import { connectToDatabase } from '@/helpers/db-utils';
import { getSession } from 'next-auth/client';

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: 'Unauthorized' });

  const role = session.user.role || 'litigant';
  if (role !== 'magistrate' && role !== 'clerk') {
    return res.status(403).json({ message: 'Only magistrates and clerks can delete cases' });
  }

  const client = await connectToDatabase();
  const db = client.db();
  const response = await db.collection('cases').deleteOne({ uid: req.body });
  client.close();

  return res.status(200).json({ message: 'Case deleted successfully', response });
}

export default handler;
