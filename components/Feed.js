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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            {isPrivileged ? 'All Cases' : 'My Cases'}
          </h2>
          <p className="text-sm text-slate-500">{visibleCases.length} case{visibleCases.length !== 1 ? 's' : ''}</p>
        </div>
        {canAdd && (
          <Link href="/dashboard/AddCases">
            <a className="text-blue-600 hover:text-blue-500 text-sm font-medium flex items-center gap-1 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Register Case
            </a>
          </Link>
        )}
      </div>

      {visibleCases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-slate-700 font-semibold text-lg mb-1">No cases found</h3>
          <p className="text-slate-400 text-sm mb-5">
            {isPrivileged ? 'No cases have been registered yet.' : 'You have no cases registered in the system.'}
          </p>
          {canAdd && (
            <Link href="/dashboard/AddCases">
              <a className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                Register First Case
              </a>
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Case No.</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Complainant</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hearing Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
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
            <p className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100">
              Hover a row and click the ✏️ pencil icon to edit inline.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Feed;
