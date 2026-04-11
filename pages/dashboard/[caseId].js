import DisplayCaseDetails from '@/components/DisplayCaseDetails';
import { connectToDatabase } from '@/helpers/db-utils';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getSession } from 'next-auth/client';

function CaseDetailsPage(props) {
  const parsedData = JSON.parse(props.caseDetail);
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{parsedData.case_number || `Case — E-Judiciary CMS`}</title>
        <meta name="description" content="Case details — E-Judiciary CMS" />
      </Head>
      <DisplayCaseDetails
        caseDetail={parsedData}
        userRole={props.userRole}
      />
    </>
  );
}

export async function getServerSideProps(context) {
  const caseId = context.params.caseId;

  const session = await getSession({ req: context.req });
  if (!session) {
    return { redirect: { destination: '/auth', permanent: false } };
  }

  const client = await connectToDatabase();
  const db = client.db();
  const response = await db.collection('cases').findOne({ uid: caseId });
  client.close();

  if (!response) {
    return { redirect: { destination: '/dashboard', permanent: false } };
  }

  const stringifiedData = JSON.stringify(response);
  const parsedData = JSON.parse(stringifiedData);

  const role = session.user.role || 'litigant';
  const canSeeAll = role === 'magistrate' || role === 'clerk';

  // Litigants can only see cases they registered
  if (!canSeeAll && parsedData.registered_by !== session.user.email) {
    return { redirect: { destination: '/dashboard', permanent: false } };
  }

  return {
    props: {
      caseDetail: stringifiedData,
      userRole: role,
    },
  };
}

export default CaseDetailsPage;
