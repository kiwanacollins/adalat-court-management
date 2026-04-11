import { useState } from 'react';
import Link from 'next/link';
import { STATUS_COLORS } from '@/components/CaseStatusActions';

const STATUS_STEPS = ['Pending', 'Scheduled', 'Adjourned', 'Concluded'];

function StatusTracker({ status }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  const isDismissed = status === 'Dismissed';
  return (
    <div className="flex items-center gap-1 mt-3">
      {isDismissed ? (
        <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">Case Dismissed</span>
      ) : (
        STATUS_STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold transition-colors ${
              i < currentIdx ? 'bg-green-100 text-green-700' :
              i === currentIdx ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' :
              'bg-slate-100 text-slate-400'
            }`}>
              {i < currentIdx && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              {step}
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`h-0.5 w-3 rounded ${i < currentIdx ? 'bg-green-300' : 'bg-slate-200'}`} />
            )}
          </div>
        ))
      )}
    </div>
  );
}

function CaseCard({ c }) {
  const statusColor = STATUS_COLORS[c.status] || 'bg-slate-100 text-slate-700';
  const isActive = !['Concluded', 'Dismissed'].includes(c.status);
  const nextHearing = c.hearing_date && isActive ? c.hearing_date : null;

  const daysUntil = nextHearing
    ? Math.ceil((new Date(nextHearing) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Link href={`/dashboard/${c.uid}`}>
      <a className="block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5 group">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs font-mono text-slate-400">{c.case_number}</p>
            <h3 className="text-base font-semibold text-slate-800 mt-0.5 group-hover:text-blue-600 transition-colors">{c.case_type}</h3>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>{c.status || 'Pending'}</span>
            {c.priority === 'Urgent' && (
              <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Urgent</span>
            )}
          </div>
        </div>

        <p className="text-sm text-slate-500 line-clamp-2">{c.case_description || 'No description provided.'}</p>

        {nextHearing && (
          <div className={`mt-3 flex items-center gap-2 rounded-xl p-3 ${daysUntil <= 1 ? 'bg-red-50' : daysUntil <= 3 ? 'bg-amber-50' : 'bg-blue-50'}`}>
            <svg className={`w-4 h-4 flex-shrink-0 ${daysUntil <= 1 ? 'text-red-500' : daysUntil <= 3 ? 'text-amber-500' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className={`text-xs font-semibold ${daysUntil <= 1 ? 'text-red-700' : daysUntil <= 3 ? 'text-amber-700' : 'text-blue-700'}`}>
                {daysUntil === 0 ? 'Hearing TODAY' : daysUntil === 1 ? 'Hearing TOMORROW' : `Hearing in ${daysUntil} days`}
              </p>
              <p className="text-xs text-slate-500">{nextHearing}{c.hearing_time ? ` at ${c.hearing_time}` : ''}</p>
            </div>
          </div>
        )}

        <StatusTracker status={c.status} />
      </a>
    </Link>
  );
}

function NextHearingBanner({ c }) {
  if (!c) return null;
  const daysUntil = Math.ceil((new Date(c.hearing_date) - new Date()) / (1000 * 60 * 60 * 24));
  return (
    <Link href={`/dashboard/${c.uid}`}>
      <a className="block bg-[#0f172a] rounded-2xl p-6 hover:bg-slate-800 transition-colors">
        <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Your Next Hearing</p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-white text-xl font-bold">{c.case_number}</h2>
            <p className="text-slate-300 text-sm mt-1">{c.case_type}</p>
            <p className="text-slate-400 text-xs mt-1">{c.courtroom || 'Courtroom TBD'} · {c.assigned_magistrate || 'Magistrate TBD'}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-blue-400 text-3xl font-bold">{daysUntil === 0 ? 'Today' : `${daysUntil}d`}</p>
            <p className="text-slate-400 text-xs mt-1">{c.hearing_date}{c.hearing_time ? ` · ${c.hearing_time}` : ''}</p>
          </div>
        </div>
      </a>
    </Link>
  );
}

export default function LitigantDashboard({ cases: initialCases, userEmail, userName }) {
  const [cases, setCases] = useState(initialCases);
  const today = new Date().toISOString().split('T')[0];

  const activeCases = cases.filter((c) => !['Concluded', 'Dismissed'].includes(c.status));
  const concludedCases = cases.filter((c) => c.status === 'Concluded');

  // Next upcoming hearing
  const nextHearing = cases
    .filter((c) => c.hearing_date >= today && ['Scheduled', 'Adjourned'].includes(c.status))
    .sort((a, b) => {
      const dateCompare = a.hearing_date.localeCompare(b.hearing_date);
      return dateCompare !== 0 ? dateCompare : (a.hearing_time || '').localeCompare(b.hearing_time || '');
    })[0] || null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-medium mb-1">
            {new Date().toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome, <span className="text-blue-600">{userName.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Litigant · Lwengo Grade I Magistrate&apos;s Court</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
            <p className="text-3xl font-bold text-slate-800">{cases.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Total Cases</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{activeCases.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Active</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{concludedCases.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Concluded</p>
          </div>
        </div>

        {/* Next hearing banner */}
        <NextHearingBanner c={nextHearing} />

        {/* Cases */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            My Cases
            <span className="ml-2 text-sm font-normal text-slate-400">({cases.length})</span>
          </h2>
          {cases.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <p className="text-3xl mb-3">📂</p>
              <p className="text-slate-600 font-semibold">No cases found</p>
              <p className="text-slate-400 text-sm mt-1">Your registered cases will appear here once a clerk or magistrate creates them.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cases.map((c) => <CaseCard key={c.uid} c={c} />)}
            </div>
          )}
        </section>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <p className="text-sm text-blue-700 font-semibold mb-1">Need help?</p>
          <p className="text-xs text-blue-600">
            Contact Lwengo Grade I Magistrate&apos;s Court Registry for case enquiries.
            Visit the court or check your <Link href="/dashboard/notifications"><a className="underline font-medium">notifications</a></Link> for updates.
          </p>
        </div>
      </div>
    </div>
  );
}
