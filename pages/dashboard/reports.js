import { connectToDatabase } from '@/helpers/db-utils';
import { getSession } from 'next-auth/client';
import Head from 'next/head';
import Link from 'next/link';

function StatCard({ label, value, color }) {
  return (
    <div className={`rounded-2xl p-6 ${color}`}>
      <p className="text-sm font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-4xl font-bold mt-1">{value}</p>
    </div>
  );
}

function BarChart({ data, maxValue }) {
  return (
    <div className="space-y-3">
      {data.map(({ label, value }) => {
        const width = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
        return (
          <div key={label} className="flex items-center gap-3">
            <span className="text-sm text-slate-600 w-28 flex-shrink-0 truncate">{label}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700 w-6 text-right">{value}</span>
          </div>
        );
      })}
    </div>
  );
}

function ReportsPage({ stats, typeBreakdown, statusBreakdown, upcomingHearings, magistrateWorkload }) {
  const maxTypeCount = Math.max(...typeBreakdown.map((t) => t.value), 1);
  const maxWorkloadCount = Math.max(...magistrateWorkload.map((m) => m.value), 1);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Case Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Lwengo Grade I Magistrate&apos;s Court — {new Date().toLocaleDateString('en-UG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Cases" value={stats.total} color="bg-blue-600 text-white" />
          <StatCard label="Active" value={stats.active} color="bg-amber-500 text-white" />
          <StatCard label="Concluded" value={stats.concluded} color="bg-green-600 text-white" />
          <StatCard label="Upcoming (7d)" value={stats.upcoming7} color="bg-indigo-600 text-white" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Cases by type */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-5">Cases by Type</h2>
            {typeBreakdown.length === 0 ? (
              <p className="text-slate-400 text-sm">No data.</p>
            ) : (
              <BarChart data={typeBreakdown} maxValue={maxTypeCount} />
            )}
          </div>

          {/* Cases by status */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-5">Cases by Status</h2>
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-3 text-left">Status</th>
                  <th className="pb-3 text-right">Count</th>
                  <th className="pb-3 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {statusBreakdown.map(({ label, value }) => (
                  <tr key={label}>
                    <td className="py-2.5 text-sm text-slate-700">{label}</td>
                    <td className="py-2.5 text-sm font-semibold text-slate-800 text-right">{value}</td>
                    <td className="py-2.5 text-xs text-slate-500 text-right">
                      {stats.total > 0 ? Math.round((value / stats.total) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming hearings */}
        <div className="bg-white rounded-2xl border border-slate-100 mb-8">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Upcoming Hearings — Next 14 Days</h2>
          </div>
          {upcomingHearings.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">No hearings scheduled in the next 14 days.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Case No.</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Complainant</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Magistrate</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {upcomingHearings.map((c) => (
                    <tr key={c.uid} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <Link href={`/dashboard/${c.uid}`}>
                          <a className="text-blue-600 hover:underline text-sm font-mono">{c.case_number}</a>
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600">{c.case_type}</td>
                      <td className="px-6 py-3 text-sm text-slate-700">{c.complainant_name || '—'}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{c.assigned_magistrate || '—'}</td>
                      <td className="px-6 py-3 text-sm text-slate-700 font-medium">{c.hearing_date}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{c.hearing_time || '—'}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{c.courtroom || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Magistrate workload */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5">Magistrate Workload (Active Cases)</h2>
          {magistrateWorkload.length === 0 ? (
            <p className="text-slate-400 text-sm">No active cases assigned.</p>
          ) : (
            <BarChart data={magistrateWorkload} maxValue={maxWorkloadCount} />
          )}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });
  if (!session) return { redirect: { destination: '/auth', permanent: false } };

  const role = session.user.role || 'litigant';
  if (role !== 'magistrate' && role !== 'clerk') {
    return { redirect: { destination: '/dashboard', permanent: false } };
  }

  try {
    const client = await connectToDatabase();
    const db = client.db();
    const allCases = await db.collection('cases').find().toArray();
    client.close();

    const today = new Date().toISOString().split('T')[0];
    const in14Days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const active = allCases.filter((c) => !['Concluded', 'Dismissed'].includes(c.status));
    const upcoming7 = allCases.filter(
      (c) => c.hearing_date >= today && c.hearing_date <= in7Days && c.status === 'Scheduled'
    );
    const upcoming14 = allCases.filter(
      (c) => c.hearing_date >= today && c.hearing_date <= in14Days && c.status === 'Scheduled'
    ).sort((a, b) => a.hearing_date.localeCompare(b.hearing_date));

    const caseTypes = ['Criminal', 'Civil', 'Land Dispute', 'Family', 'Others'];
    const typeBreakdown = caseTypes.map((t) => ({
      label: t,
      value: allCases.filter((c) => c.case_type === t).length,
    })).filter((t) => t.value > 0);

    const statuses = ['Pending', 'Scheduled', 'Adjourned', 'Concluded', 'Dismissed'];
    const statusBreakdown = statuses.map((s) => ({
      label: s,
      value: allCases.filter((c) => c.status === s).length,
    }));

    const magistrateMap = {};
    active.forEach((c) => {
      const m = c.assigned_magistrate || 'Unassigned';
      magistrateMap[m] = (magistrateMap[m] || 0) + 1;
    });
    const magistrateWorkload = Object.entries(magistrateMap)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    return {
      props: {
        stats: {
          total: allCases.length,
          active: active.length,
          concluded: allCases.filter((c) => c.status === 'Concluded').length,
          upcoming7: upcoming7.length,
        },
        typeBreakdown,
        statusBreakdown,
        upcomingHearings: JSON.parse(JSON.stringify(upcoming14)),
        magistrateWorkload,
      },
    };
  } catch {
    return {
      props: {
        stats: { total: 0, active: 0, concluded: 0, upcoming7: 0 },
        typeBreakdown: [],
        statusBreakdown: [],
        upcomingHearings: [],
        magistrateWorkload: [],
      },
    };
  }
}

export default function ReportsWrapper(props) {
  return (
    <>
      <Head>
        <title>Reports — E-Judiciary CMS</title>
      </Head>
      <ReportsPage {...props} />
    </>
  );
}
