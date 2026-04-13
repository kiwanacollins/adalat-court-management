import { verifyPassword } from '@/helpers/auth-utils';
import { connectToDatabase } from '@/helpers/db-utils';
import { findLocalUserByEmail } from '@/helpers/local-user-store';
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    jwt: true,
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  providers: [
    Providers.Credentials({
      async authorize(credentials) {
        try {
          const client = await connectToDatabase();
          const usersCollection = client.db().collection('users');

          const user = await usersCollection.findOne({
            email: credentials.email,
          });

          if (!user) {
            client.close();
            throw new Error('No user found!');
          }

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
            name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
            role: user.role || 'litigant',
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
            role: localUser.role || 'litigant',
          };
        }
      },
    }),
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt(token, user) {
      if (user) {
        token.role = user.role || 'litigant';
        token.name = user.name || '';
      }
      return token;
    },
    async session(session, token) {
      if (!session.user) {
        session.user = {};
      }
      session.user.role = token.role || 'litigant';
      if (token.name) session.user.name = token.name;
      return session;
    },
  },
});
