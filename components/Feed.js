import FeedRow from './FeedRow';
import Link from 'next/link';

function Feed({ cases, userEmail }) {
  const userCases = cases.filter((item) => item.email === userEmail);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      {/* Table header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">My Cases</h2>
          <p className="text-sm text-slate-500">{userCases.length} case{userCases.length !== 1 ? 's' : ''} registered</p>
        </div>
        <Link href="/dashboard/AddCases">
          <a className="text-blue-600 hover:text-blue-500 text-sm font-medium flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Case
          </a>
        </Link>
      </div>

      {userCases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-slate-700 font-semibold text-lg mb-1">No cases yet</h3>
          <p className="text-slate-400 text-sm mb-5">Start by adding your first court case to track hearings and updates.</p>
          <Link href="/dashboard/AddCases">
            <a className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              Add Your First Case
            </a>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Case Type</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lawyer</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hearing Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userCases.map((item, index) => (
                <FeedRow key={item._id} case={item} number={index} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Feed;
