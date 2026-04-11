import { hashPassword } from '@/helpers/auth-utils';
import { connectToDatabase } from '@/helpers/db-utils';
import { createLocalUser, findLocalUserByEmail } from '@/helpers/local-user-store';

const VALID_ROLES = ['magistrate', 'clerk', 'litigant'];

async function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;
    const { email, password, firstName, lastName, role } = data;

    const userRole = VALID_ROLES.includes(role) ? role : 'litigant';

    if (
      !email ||
      !email.includes('@') ||
      !password ||
      password.trim().length < 7
    ) {
      res.status(422).json({
        message: 'Invalid Input - password has to be atleast 7 characters long!',
      });
      return;
    }

    let hashedPassword;

    try {
      hashedPassword = await hashPassword(password);
      const client = await connectToDatabase();
      const db = client.db();

      const existingUser = await db.collection('users').findOne({ email: email });
      if (existingUser) {
        res.status(422).json({ message: 'User already exists!' });
        client.close();
        return;
      }

      const result = await db.collection('users').insertOne({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: userRole,
      });

      res.status(201).json({ message: 'Created User!!', result });
      client.close();
      return;
    } catch (error) {
      try {
        const existingLocalUser = await findLocalUserByEmail(email);
        if (existingLocalUser) {
          res.status(422).json({ message: 'User already exists!' });
          return;
        }

        const localResult = await createLocalUser({
          email,
          password: hashedPassword || (await hashPassword(password)),
          firstName,
          lastName,
          role: userRole,
        });

        res
          .status(201)
          .json({ message: 'Created User!! (local store)', result: localResult });
        return;
      } catch (fallbackError) {
        res.status(500).json({
          message:
            fallbackError.message || 'Unable to create account at the moment.',
        });
        return;
      }
    }
  }
}

export default handler;
