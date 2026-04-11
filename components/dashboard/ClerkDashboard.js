import { useState } from 'react';
import Link from 'next/link';
import Feed from '@/components/Feed';

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className={`rounded-2xl p-5 ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <p className="text-sm font-semibold">{label}</p>
      {sub && <p className="text-xs opacity-70 mt-0.5">{sub}</p>}
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-widest font-medium mb-1">
                {new Date().toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Court Registry — <span className="text-blue-600">Overview</span>
              </h1>
              <p className="text-slate-500 text-sm mt-1">Clerk · {userName} · Lwengo Grade I Magistrate&apos;s Court</p>
            </div>
            <Link href="/dashboard/AddCases">
              <a className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3 rounded-xl transition-colors text-sm w-fit">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Register New Case
              </a>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Needs Scheduling</h2>
              {unscheduled.length > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{unscheduled.length}</span>
              )}
            </div>
            <div className="px-5 py-2 max-h-72 overflow-y-auto">
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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Today&apos;s Court Schedule</h2>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('en-UG', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="px-5 py-2 max-h-72 overflow-y-auto">
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
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-4">
            {[
              { key: 'all', label: `All Cases (${cases.length})` },
              { key: 'pending', label: `Pending (${pendingCases.length})` },
              { key: 'urgent', label: `Urgent (${urgentCases.length})` },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
