import { useState } from 'react';
import Link from 'next/link';
import Feed from '@/components/Feed';
import { STATUS_COLORS } from '@/components/CaseStatusActions';

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`rounded-2xl p-5 flex items-center gap-4 ${color}`}>
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
        <p className="text-3xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function HearingCard({ c }) {
  const statusColor = STATUS_COLORS[c.status] || 'bg-slate-100 text-slate-700';
  return (
    <Link href={`/dashboard/${c.uid}`}>
      <a className="block bg-stone-50 border border-stone-200 rounded-2xl p-4 hover:border-amber-200 hover:shadow-md transition-all group">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-mono text-slate-400">{c.case_number}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>{c.status}</span>
        </div>
        <p className="font-semibold text-slate-800 text-sm group-hover:text-amber-700 transition-colors">{c.case_type}</p>
        <p className="text-slate-500 text-xs mt-1">{c.complainant_name} <span className="text-slate-300">vs</span> {c.respondent_name}</p>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-slate-500">{c.hearing_time || 'Time TBD'} · {c.courtroom || 'Room TBD'}</span>
        </div>
      </a>
    </Link>
  );
}

export default function MagistrateDashboard({ cases: initialCases, userName, userEmail }) {
  const [allCases, setAllCases] = useState(initialCases);

  function handleCaseUpdate(uid, updates) {
    setAllCases((prev) => prev.map((c) => (c.uid === uid ? { ...c, ...updates } : c)));
  }

  const today = new Date().toISOString().split('T')[0];
  const next7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Cases assigned to this magistrate
  const myCases = allCases.filter(
    (c) => c.assigned_magistrate && c.assigned_magistrate.toLowerCase() === userName.toLowerCase()
  );

  const todayHearings = myCases.filter((c) => c.hearing_date === today && ['Scheduled', 'Adjourned'].includes(c.status))
    .sort((a, b) => (a.hearing_time || '').localeCompare(b.hearing_time || ''));
  const upcomingCount = myCases.filter((c) => c.hearing_date > today && c.hearing_date <= next7 && c.status === 'Scheduled').length;
  const activeCount = myCases.filter((c) => !['Concluded', 'Dismissed'].includes(c.status)).length;
  const concludedCount = myCases.filter((c) => c.status === 'Concluded').length;
  const urgentCount = myCases.filter((c) => c.priority === 'Urgent' && !['Concluded', 'Dismissed'].includes(c.status)).length;

  const [tab, setTab] = useState('assigned');
  const pendingCases = myCases.filter((c) => c.status === 'Pending');

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="border-b border-stone-800/40 bg-[linear-gradient(135deg,#0f172a_0%,#111827_55%,#1c1917_100%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-stone-400 text-xs uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-stone-50 text-2xl sm:text-3xl font-bold">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="text-amber-300">{userName.split(' ')[0]}</span>
          </h1>
          <p className="text-stone-300 text-sm mt-1">Magistrate · Lwengo Grade I Magistrate&apos;s Court</p>
        </div>

        {/* Stat strip */}
        <div className="border-t border-stone-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Assigned Cases" value={myCases.length} color="bg-stone-800/55 text-stone-50" icon="📁" />
            <StatCard label="Today's Hearings" value={todayHearings.length} color="bg-amber-900/45 text-stone-50" icon="⚖️" />
            <StatCard label="Next 7 Days" value={upcomingCount} color="bg-emerald-900/45 text-stone-50" icon="📅" />
            <StatCard label="Urgent Cases" value={urgentCount} color={urgentCount > 0 ? 'bg-rose-900/45 text-stone-50' : 'bg-stone-700/50 text-stone-50'} icon="🔴" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Today's hearings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Today&apos;s Hearings
              {todayHearings.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{todayHearings.length}</span>
              )}
            </h2>
          </div>
          {todayHearings.length === 0 ? (
            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-8 text-center">
              <p className="text-3xl mb-2">☀️</p>
              <p className="text-slate-600 font-medium">No hearings scheduled for today</p>
              <p className="text-slate-400 text-sm mt-1">Your calendar is clear.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayHearings.map((c) => <HearingCard key={c.uid} c={c} />)}
            </div>
          )}
        </section>

        {/* Case tabs */}
        <section>
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl w-fit mb-4">
            {[
              { key: 'assigned', label: `All Assigned (${myCases.length})` },
              { key: 'pending', label: `Unscheduled (${pendingCases.length})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-stone-50 text-slate-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Feed
            key={tab}
            cases={tab === 'assigned' ? myCases : pendingCases}
            userEmail={userEmail}
            userRole="magistrate"
            onCaseUpdate={handleCaseUpdate}
          />
        </section>
      </div>
    </div>
  );
}
