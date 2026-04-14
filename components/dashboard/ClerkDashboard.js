import { useState } from 'react';
import Link from 'next/link';
import Feed from '@/components/Feed';

const STAT_TONES = {
  stone: {
    card: 'border-stone-200/80 bg-stone-50',
    chip: 'bg-stone-100 text-stone-700 ring-stone-200',
    value: 'text-slate-900',
  },
  amber: {
    card: 'border-amber-200/80 bg-amber-50',
    chip: 'bg-amber-50 text-amber-700 ring-amber-100',
    value: 'text-slate-900',
  },
  emerald: {
    card: 'border-emerald-200/80 bg-emerald-50',
    chip: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    value: 'text-slate-900',
  },
  rose: {
    card: 'border-rose-200/80 bg-rose-50',
    chip: 'bg-rose-50 text-rose-700 ring-rose-100',
    value: 'text-slate-900',
  },
};

function StatCard({ label, value, sub, tone = 'stone', icon }) {
  const styles = STAT_TONES[tone] || STAT_TONES.stone;

  return (
    <div className={`rounded-[1.5rem] border p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)] ${styles.card}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-xl ring-1 ${styles.chip}`}>
          {icon}
        </span>
        <p className={`text-3xl font-semibold tracking-tight ${styles.value}`}>{value}</p>
      </div>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function UnscheduledRow({ c }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{c.case_number} — {c.case_type}</p>
        <p className="text-xs text-slate-500 mt-0.5">{c.complainant_name} vs {c.respondent_name}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {c.priority === 'Urgent' && (
          <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Urgent</span>
        )}
        <Link href={`/dashboard/${c.uid}`}>
          <a className="text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors">
            Schedule →
          </a>
        </Link>
      </div>
    </div>
  );
}

function TodaySlot({ c }) {
  return (
    <Link href={`/dashboard/${c.uid}`}>
      <a className="flex items-center gap-3 py-2.5 border-b border-stone-100 last:border-0 hover:bg-stone-100 rounded-lg px-2 transition-colors group">
        <div className="bg-amber-100 rounded-lg px-2 py-1 text-center min-w-[52px]">
          <p className="text-xs font-bold text-amber-800">{c.hearing_time || '—'}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800 truncate group-hover:text-amber-700 transition-colors">{c.case_number} · {c.case_type}</p>
          <p className="text-xs text-slate-500">{c.courtroom || 'Room TBD'} · {c.assigned_magistrate || 'Unassigned'}</p>
        </div>
      </a>
    </Link>
  );
}

export default function ClerkDashboard({ cases: initialCases, userEmail, userName }) {
  const [allCases, setAllCases] = useState(initialCases);

  function handleCaseUpdate(uid, updates) {
    setAllCases((prev) => prev.map((c) => (c.uid === uid ? { ...c, ...updates } : c)));
  }

  const today = new Date().toISOString().split('T')[0];

  const totalCases = allCases.length;
  const pendingCases = allCases.filter((c) => c.status === 'Pending');
  const unscheduled = allCases.filter((c) => c.status === 'Pending' && !c.hearing_date);
  const urgentCases = allCases.filter((c) => c.priority === 'Urgent' && !['Concluded', 'Dismissed'].includes(c.status));
  const todayHearings = allCases
    .filter((c) => c.hearing_date === today && ['Scheduled', 'Adjourned'].includes(c.status))
    .sort((a, b) => (a.hearing_time || '').localeCompare(b.hearing_time || ''));

  const [tab, setTab] = useState('all');
  const tabCases = {
    all: allCases,
    pending: pendingCases,
    urgent: urgentCases,
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,241,234,0.96),_rgba(228,232,240,1))]">
      {/* Header */}
      <div className="border-b border-stone-800/40 bg-[linear-gradient(135deg,#0f172a_0%,#111827_55%,#1c1917_100%)] text-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.26em] text-stone-400">
                {new Date().toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-stone-50 sm:text-3xl">
                Court Registry — <span className="text-amber-300">Overview</span>
              </h1>
              <p className="mt-1 text-sm text-stone-300">Clerk · {userName} · Lwengo Grade I Magistrate&apos;s Court</p>
            </div>
            <Link href="/dashboard/AddCases">
              <a className="inline-flex w-fit items-center gap-2 rounded-full bg-stone-100 px-5 py-3 text-sm font-semibold text-slate-900 transition-transform duration-200 hover:scale-[1.02] hover:bg-stone-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Register New Case
              </a>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Cases" value={totalCases} tone="stone" icon="📋" />
          <StatCard label="Unscheduled" value={unscheduled.length} sub="Pending scheduling" tone="amber" icon="📌" />
          <StatCard label="Today's Court" value={todayHearings.length} sub="Hearings today" tone="emerald" icon="⚖️" />
          <StatCard label="Urgent" value={urgentCases.length} sub="Require attention" tone="rose" icon="🔴" />
        </div>

        {/* Two-column layout: unscheduled + today */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Unscheduled cases */}
          <div className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-stone-50 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-100/80 px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">Registry Queue</p>
                <h2 className="mt-1 text-base font-semibold text-slate-900">Needs Scheduling</h2>
              </div>
              {unscheduled.length > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{unscheduled.length}</span>
              )}
            </div>
            <div className="max-h-72 px-5 py-2 overflow-y-auto">
              {unscheduled.length === 0 ? (
                <p className="text-slate-400 text-sm py-6 text-center">All cases have hearing dates. ✅</p>
              ) : (
                unscheduled.slice(0, 10).map((c) => <UnscheduledRow key={c.uid} c={c} />)
              )}
            </div>
            {unscheduled.length > 10 && (
              <div className="px-5 py-3 border-t border-slate-100">
                <p className="text-xs text-slate-400">+{unscheduled.length - 10} more pending cases</p>
              </div>
            )}
          </div>

          {/* Today's schedule */}
          <div className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-stone-50 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-100/80 px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">Daily List</p>
                <h2 className="mt-1 text-base font-semibold text-slate-900">Today&apos;s Court Schedule</h2>
              </div>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('en-UG', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="max-h-72 px-5 py-2 overflow-y-auto">
              {todayHearings.length === 0 ? (
                <p className="text-slate-400 text-sm py-6 text-center">No hearings scheduled for today.</p>
              ) : (
                todayHearings.map((c) => <TodaySlot key={c.uid} c={c} />)
              )}
            </div>
            {todayHearings.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100">
                <Link href="/dashboard/reports">
                  <a className="text-xs text-amber-700 hover:text-amber-800 font-medium">View full reports →</a>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* All cases table with tabs */}
        <section>
          <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-stone-100 p-1">
            {[
              { key: 'all', label: `All Cases (${allCases.length})` },
              { key: 'pending', label: `Pending (${pendingCases.length})` },
              { key: 'urgent', label: `Urgent (${urgentCases.length})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? 'bg-stone-50 text-slate-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Feed key={tab} cases={tabCases[tab]} userEmail={userEmail} userRole="clerk" onCaseUpdate={handleCaseUpdate} />
        </section>
      </div>
    </div>
  );
}
