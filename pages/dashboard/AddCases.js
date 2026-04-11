import AddCase from '@/components/AddCase';
import { getSession } from 'next-auth/client';
import Head from 'next/head';

function AddCases() {
  return (
    <>
      <Head>
        <title>Register Case — E-Judiciary CMS</title>
        <meta name="description" content="Register a new court case at Lwengo Grade I Magistrate's Court." />
      </Head>
      <AddCase />
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });

  if (!session) {
    return { redirect: { destination: '/auth', permanent: false } };
  }

  const role = session.user.role || 'litigant';
  if (role !== 'magistrate' && role !== 'clerk') {
    return { redirect: { destination: '/dashboard', permanent: false } };
  }

  return { props: {} };
}

export default AddCases;
