import { verifyPassword } from '@/helpers/auth-utils';
import { connectToDatabase } from '@/helpers/db-utils';
import { findLocalUserByEmail } from '@/helpers/local-user-store';
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

export default NextAuth({
  session: {
    jwt: true,
  },
  providers: [
    Providers.Credentials({
      async authorize(credentials) {
        try {
          const client = await connectToDatabase();

          const usersCollection = client.db().collection('users');

          // find user if exists
          const user = await usersCollection.findOne({
            email: credentials.email,
          });

          if (!user) {
            client.close();
            throw new Error('No user found!');
          }

          // compare passwords
          const isValid = await verifyPassword(
            credentials.password,
            user.password
          );

          if (!isValid) {
            client.close();
            throw new Error('Invalid password!');
          }

          client.close();

          return {
            email: user.email,
          };
        } catch (error) {
          const localUser = await findLocalUserByEmail(credentials.email);

          if (!localUser) {
            throw new Error('No user found!');
          }

          const isValid = await verifyPassword(
            credentials.password,
            localUser.password
          );

          if (!isValid) {
            throw new Error('Invalid password!');
          }

          return {
            email: localUser.email,
            name:
              [localUser.firstName, localUser.lastName]
                .filter(Boolean)
                .join(' ') || localUser.email,
          };
        }
      },
    }),
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});
