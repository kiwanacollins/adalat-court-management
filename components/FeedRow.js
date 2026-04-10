import Link from 'next/link';

const caseTypeColors = {
  Civil: 'bg-blue-100 text-blue-700',
  Criminal: 'bg-red-100 text-red-700',
  Family: 'bg-purple-100 text-purple-700',
  Corporate: 'bg-indigo-100 text-indigo-700',
  Property: 'bg-green-100 text-green-700',
  Default: 'bg-slate-100 text-slate-600',
};

function FeedRow(props) {
  const today = new Date().toISOString().split('T')[0];
  const hearingDate = props.case.Hearing_Date || '';
  const isUpcoming = hearingDate && hearingDate >= today;
  const isPast = hearingDate && hearingDate < today;

  const caseType = props.case.Case_Type || '';
  const badgeColor = caseTypeColors[caseType] || caseTypeColors.Default;

  const formattedDate = hearingDate
    ? new Date(hearingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
        {props.number + 1}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}>
          {caseType || 'N/A'}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
            {(props.case.Lawyer_Name || '?')[0].toUpperCase()}
          </div>
          <span className="text-sm text-slate-700 font-medium">{props.case.Lawyer_Name || '—'}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">{formattedDate}</td>
      <td className="px-6 py-4">
        {isUpcoming && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Upcoming
          </span>
        )}
        {isPast && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Concluded
          </span>
        )}
        {!hearingDate && (
          <span className="text-xs text-slate-400">No date set</span>
        )}
      </td>
      <td className="px-6 py-4">
        <Link href={`/dashboard/${props.case.uid}`}>
          <a className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors">
            View
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </Link>
      </td>
    </tr>
  );
}

export default FeedRow;
