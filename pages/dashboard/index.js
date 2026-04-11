import Feed from '@/components/Feed';
import { connectToDatabase } from '@/helpers/db-utils';
import { getSession } from 'next-auth/client';
import Head from 'next/head';
import Link from 'next/link';

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function Dashboard(props) {
  const allCases = JSON.parse(props.cases);
  const { userRole } = props;
  const isPrivileged = userRole === 'magistrate' || userRole === 'clerk';

  const today = new Date().toISOString().split('T')[0];
  const viewableCases = isPrivileged
    ? allCases
    : allCases.filter((c) => c.registered_by === props.session.user.email);

  const scheduledCount = viewableCases.filter((c) => c.status === 'Scheduled').length;
  const concludedCount = viewableCases.filter((c) => c.status === 'Concluded').length;
  const upcomingCount = viewableCases.filter(
    (c) => c.hearing_date && c.hearing_date >= today && c.status === 'Scheduled'
  ).length;

  const userName = props.session.user.name || props.session.user.email.split('@')[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>Dashboard — E-Judiciary CMS</title>
        <meta name="description" content="E-Judiciary CMS — Lwengo Grade I Magistrate's Court" />
      </Head>

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-slate-500 text-sm uppercase tracking-widest font-medium mb-1">
                {new Date().toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Welcome back, <span className="text-blue-600 capitalize">{userName}</span>
              </h1>
              <p className="text-slate-500 text-sm mt-1 capitalize">{userRole} · Lwengo Grade I Magistrate&apos;s Court</p>
            </div>
            {isPrivileged && (
              <Link href="/dashboard/AddCases">
                <a className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3 rounded-xl transition-colors text-sm w-fit">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Register New Case
                </a>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Cases"
            value={viewableCases.length}
            color="bg-blue-100"
            icon={<svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <StatCard
            label="Upcoming Hearings"
            value={upcomingCount}
            color="bg-amber-100"
            icon={<svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <StatCard
            label="Scheduled"
            value={scheduledCount}
            color="bg-indigo-100"
            icon={<svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            label="Concluded"
            value={concludedCount}
            color="bg-green-100"
            icon={<svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        <Feed cases={allCases} userEmail={props.session.user.email} userRole={userRole} />
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });
  if (!session) {
    return { redirect: { destination: '/auth', permanent: false } };
  }

  const client = await connectToDatabase();
  const db = client.db();
  const response = await db.collection('cases').find().toArray();
  const stringifiedData = JSON.stringify(response);
  client.close();

  return {
    props: {
      session,
      cases: stringifiedData,
      userRole: session.user.role || 'litigant',
    },
  };
}

export default Dashboard;
