import { connectToDatabase } from '@/helpers/db-utils';
import { getSession } from 'next-auth/client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db();

    const magistrates = await db
      .collection('users')
      .find(
        { role: 'magistrate' },
        { projection: { email: 1, firstName: 1, lastName: 1 } }
      )
      .toArray();

    client.close();

    const list = magistrates.map((m) => ({
      email: m.email,
      name: [m.firstName, m.lastName].filter(Boolean).join(' ') || m.email,
    }));

    return res.status(200).json(list);
  } catch (error) {
    // Fallback: return empty list if DB not available
    return res.status(200).json([]);
  }
}
