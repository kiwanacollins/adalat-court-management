import Link from 'next/link';
import { STATUS_COLORS } from './CaseStatusActions';

const caseTypeColors = {
  Civil: 'bg-blue-100 text-blue-700',
  Criminal: 'bg-red-100 text-red-700',
  'Land Dispute': 'bg-yellow-100 text-yellow-700',
  Family: 'bg-purple-100 text-purple-700',
  Others: 'bg-slate-100 text-slate-600',
};

function FeedRow({ case: c, number }) {
  const caseType = c.case_type || '';
  const badgeColor = caseTypeColors[caseType] || 'bg-slate-100 text-slate-600';
  const statusColor = STATUS_COLORS[c.status] || 'bg-slate-100 text-slate-600';

  const formattedDate = c.hearing_date
    ? new Date(c.hearing_date).toLocaleDateString('en-UG', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-4 text-sm text-slate-500 font-mono">{c.case_number || `#${number + 1}`}</td>
      <td className="px-4 py-4">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}>
          {caseType || 'N/A'}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-slate-700 font-medium">{c.complainant_name || '—'}</td>
      <td className="px-4 py-4 text-sm text-slate-600">{formattedDate}</td>
      <td className="px-4 py-4">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>
          {c.status || 'Pending'}
        </span>
      </td>
      <td className="px-4 py-4">
        {c.priority === 'Urgent' ? (
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">Urgent</span>
        ) : (
          <span className="text-xs text-slate-400">Normal</span>
        )}
      </td>
      <td className="px-4 py-4">
        <Link href={`/dashboard/${c.uid}`}>
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
