import { useState } from 'react';
import FeedRow from './FeedRow';
import Link from 'next/link';

function Feed({ cases: initialCases, userEmail, userRole }) {
  const [cases, setCases] = useState(initialCases);
  const isPrivileged = userRole === 'magistrate' || userRole === 'clerk';
  const visibleCases = isPrivileged
    ? cases
    : cases.filter((c) => c.registered_by === userEmail);

  function handleUpdate(uid, updates) {
    setCases((prev) => prev.map((c) => (c.uid === uid ? { ...c, ...updates } : c)));
  }

  const canAdd = isPrivileged;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 backdrop-blur">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Case Register</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {isPrivileged ? 'All Cases' : 'My Cases'}
          </h2>
          <p className="text-sm text-slate-500">
            {visibleCases.length} case{visibleCases.length !== 1 ? 's' : ''} in view
          </p>
        </div>
        {canAdd && (
          <Link href="/dashboard/AddCases">
            <a className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] hover:bg-slate-800">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Register Case
            </a>
          </Link>
        )}
      </div>

      {visibleCases.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-slate-900">No cases found</h3>
          <p className="mb-5 max-w-sm text-sm leading-6 text-slate-500">
            {isPrivileged ? 'No cases have been registered yet.' : 'You have no cases registered in the system.'}
          </p>
          {canAdd && (
            <Link href="/dashboard/AddCases">
              <a className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] hover:bg-slate-800">
                Register First Case
              </a>
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/90 text-left">
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Case No.</th>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Type</th>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Complainant</th>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Hearing Date</th>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Status</th>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Priority</th>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleCases.map((item, index) => (
                <FeedRow
                  key={item._id || item.uid}
                  case={item}
                  number={index}
                  canEdit={isPrivileged}
                  onUpdate={handleUpdate}
                />
              ))}
            </tbody>
          </table>
          {isPrivileged && (
            <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400">
              Hover a row and click the ✏️ pencil icon to edit inline.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Feed;
