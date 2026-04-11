import { useState } from 'react';
import Link from 'next/link';
import Feed from '@/components/Feed';

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className={`rounded-[1.75rem] border border-slate-200 p-5 shadow-sm ${color}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
      </div>
      <p className="text-sm font-semibold">{label}</p>
      {sub && <p className="mt-0.5 text-xs opacity-70">{sub}</p>}
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
          <a className="text-xs font-semibold text-blue-600 hover:text-blue-500 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
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
      <a className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded-lg px-2 transition-colors group">
        <div className="bg-indigo-100 rounded-lg px-2 py-1 text-center min-w-[52px]">
          <p className="text-xs font-bold text-indigo-700">{c.hearing_time || '—'}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">{c.case_number} · {c.case_type}</p>
          <p className="text-xs text-slate-500">{c.courtroom || 'Room TBD'} · {c.assigned_magistrate || 'Unassigned'}</p>
        </div>
      </a>
    </Link>
  );
}

export default function ClerkDashboard({ cases, userEmail, userName }) {
  const today = new Date().toISOString().split('T')[0];

  const totalCases = cases.length;
  const pendingCases = cases.filter((c) => c.status === 'Pending');
  const unscheduled = cases.filter((c) => c.status === 'Pending' && !c.hearing_date);
  const urgentCases = cases.filter((c) => c.priority === 'Urgent' && !['Concluded', 'Dismissed'].includes(c.status));
  const todayHearings = cases
    .filter((c) => c.hearing_date === today && ['Scheduled', 'Adjourned'].includes(c.status))
    .sort((a, b) => (a.hearing_time || '').localeCompare(b.hearing_time || ''));

  const [tab, setTab] = useState('all');
  const tabCases = {
    all: cases,
    pending: pendingCases,
    urgent: urgentCases,
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(241,245,249,1))]">
      {/* Header */}
      <div className="border-b border-slate-200 bg-[#0f172a] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.26em] text-slate-400">
                {new Date().toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Court Registry — <span className="text-blue-400">Overview</span>
              </h1>
              <p className="mt-1 text-sm text-slate-300">Clerk · {userName} · Lwengo Grade I Magistrate&apos;s Court</p>
            </div>
            <Link href="/dashboard/AddCases">
              <a className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-transform duration-200 hover:scale-[1.02] hover:bg-slate-100">
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
          <StatCard label="Total Cases" value={totalCases} color="bg-blue-600 text-white" icon="📋" />
          <StatCard label="Unscheduled" value={unscheduled.length} sub="Pending scheduling" color={unscheduled.length > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'} icon="📌" />
          <StatCard label="Today's Court" value={todayHearings.length} sub="Hearings today" color="bg-indigo-600 text-white" icon="⚖️" />
          <StatCard label="Urgent" value={urgentCases.length} sub="Require attention" color={urgentCases.length > 0 ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'} icon="🔴" />
        </div>

        {/* Two-column layout: unscheduled + today */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Unscheduled cases */}
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Registry Queue</p>
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
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Daily List</p>
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
                  <a className="text-xs text-blue-600 hover:text-blue-500 font-medium">View full reports →</a>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* All cases table with tabs */}
        <section>
          <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-slate-100 p-1">
            {[
              { key: 'all', label: `All Cases (${cases.length})` },
              { key: 'pending', label: `Pending (${pendingCases.length})` },
              { key: 'urgent', label: `Urgent (${urgentCases.length})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Feed cases={tabCases[tab]} userEmail={userEmail} userRole="clerk" />
        </section>
      </div>
    </div>
  );
}
