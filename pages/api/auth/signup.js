import { hashPassword } from '@/helpers/auth-utils';
import { connectToDatabase } from '@/helpers/db-utils';
import { createLocalUser, findLocalUserByEmail } from '@/helpers/local-user-store';

async function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;
    const { email, password, firstName, lastName } = data;

    // server side validation
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

      //checks if user already exists from MongoDb
      const existingUser = await db.collection('users').findOne({ email: email });
      if (existingUser) {
        res.status(422).json({ message: 'User already exists!' });
        client.close();
        return;
      }

      // create user
      const result = await db.collection('users').insertOne({
        email: email,
        password: hashedPassword,
        firstName,
        lastName,
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
