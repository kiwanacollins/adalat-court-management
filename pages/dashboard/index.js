import Head from 'next/head';
import { connectToDatabase } from '@/helpers/db-utils';
import { getSession } from 'next-auth/client';
import MagistrateDashboard from '@/components/dashboard/MagistrateDashboard';
import ClerkDashboard from '@/components/dashboard/ClerkDashboard';
import LitigantDashboard from '@/components/dashboard/LitigantDashboard';

function Dashboard(props) {
  const cases = JSON.parse(props.cases);
  const { userRole, userName, userEmail } = props;

  const shared = { cases, userName, userEmail };

  return (
    <>
      <Head>
        <title>Dashboard — E-Judiciary CMS</title>
        <meta name="description" content="E-Judiciary CMS — Lwengo Grade I Magistrate's Court" />
      </Head>
      {userRole === 'magistrate' && <MagistrateDashboard {...shared} />}
      {userRole === 'clerk' && <ClerkDashboard {...shared} />}
      {userRole === 'litigant' && <LitigantDashboard {...shared} />}
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });
  if (!session) {
    return { redirect: { destination: '/auth', permanent: false } };
  }

  const role = session.user.role || 'litigant';
  const userName = session.user.name || session.user.email.split('@')[0];
  const userEmail = session.user.email;

  const client = await connectToDatabase();
  const db = client.db();

  let cases;
  if (role === 'magistrate') {
    // Magistrate: all cases — MagistrateDashboard filters client-side by assigned name
    // (handles name mismatches gracefully)
    cases = await db.collection('cases').find().toArray();
  } else if (role === 'clerk') {
    cases = await db.collection('cases').find().toArray();
  } else {
    // Litigant: only their own cases
    cases = await db.collection('cases').find({ registered_by: userEmail }).toArray();
  }

  client.close();

  return {
    props: {
      cases: JSON.stringify(cases),
      userRole: role,
      userName,
      userEmail,
    },
  };
}

export default Dashboard;
