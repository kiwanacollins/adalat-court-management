import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import CaseStatusActions, { STATUS_COLORS } from './CaseStatusActions';

const PRIORITY_COLORS = {
  Urgent: 'bg-red-100 text-red-700',
  Normal: 'bg-slate-100 text-slate-600',
};

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-slate-800 mt-0.5 text-sm">{value}</p>
    </div>
  );
}

function DisplayCaseDetails({ caseDetail, onDelete, userRole }) {
  const router = useRouter();

  async function deleteHandler() {
    if (!confirm('Are you sure you want to permanently delete this case? This cannot be undone.')) return;
    const toastId = toast.loading('Deleting case...');
    const res = await fetch('/api/case/deletecase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseDetail.uid),
    });
    toast.dismiss(toastId);
    if (res.ok) {
      toast.success('Case deleted');
      router.replace('/dashboard');
    } else {
      toast.error('Failed to delete case');
    }
  }

  const statusColor = STATUS_COLORS[caseDetail.status] || 'bg-slate-100 text-slate-700';
  const priorityColor = PRIORITY_COLORS[caseDetail.priority] || PRIORITY_COLORS.Normal;
  const canManage = userRole === 'magistrate' || userRole === 'clerk';

  const hearingFormatted = caseDetail.hearing_date
    ? new Date(caseDetail.hearing_date).toLocaleDateString('en-UG', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="bg-[#0f172a] rounded-2xl px-6 py-5 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Case Number</p>
              <h1 className="text-white text-2xl font-bold">{caseDetail.case_number || caseDetail.uid}</h1>
              <p className="text-slate-400 text-sm mt-1">Filed: {caseDetail.filing_date || '—'}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                {caseDetail.status || 'Pending'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColor}`}>
                {caseDetail.priority || 'Normal'} Priority
              </span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Case type + description */}
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Case Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Case Type" value={caseDetail.case_type} />
              <Field label="Registered By" value={caseDetail.registered_by} />
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</p>
              <p className="text-slate-700 mt-1 text-sm leading-relaxed">{caseDetail.case_description || '—'}</p>
            </div>
          </div>

          {/* Parties */}
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Parties Involved</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Complainant / Plaintiff</p>
                <p className="text-slate-800 font-medium">{caseDetail.complainant_name || '—'}</p>
                {caseDetail.complainant_contact && (
                  <p className="text-slate-500 text-sm mt-0.5">{caseDetail.complainant_contact}</p>
                )}
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Respondent / Defendant</p>
                <p className="text-slate-800 font-medium">{caseDetail.respondent_name || '—'}</p>
                {caseDetail.respondent_contact && (
                  <p className="text-slate-500 text-sm mt-0.5">{caseDetail.respondent_contact}</p>
                )}
              </div>
            </div>
          </div>

          {/* Hearing schedule */}
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Hearing Schedule</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Hearing Date" value={hearingFormatted || caseDetail.hearing_date || 'Not set'} />
              <Field label="Hearing Time" value={caseDetail.hearing_time || 'Not set'} />
              <Field label="Courtroom" value={caseDetail.courtroom || 'Not assigned'} />
            </div>
            <div className="mt-4">
              <Field label="Assigned Magistrate" value={caseDetail.assigned_magistrate || 'Not assigned'} />
            </div>
          </div>

          {/* Status history */}
          {caseDetail.status_history && caseDetail.status_history.length > 0 && (
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Status History</h2>
              <ol className="relative border-l border-slate-200 space-y-4 ml-3">
                {caseDetail.status_history.map((entry, i) => (
                  <li key={i} className="ml-4">
                    <div className="absolute -left-1.5 mt-1.5 w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[entry.status] || 'bg-slate-100 text-slate-700'}`}>
                      {entry.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(entry.date).toLocaleString('en-UG')} — {entry.changed_by}
                    </p>
                    {entry.note && <p className="text-slate-600 text-sm mt-0.5 italic">{entry.note}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 py-5">
            <CaseStatusActions caseDetail={caseDetail} userRole={userRole} />

            {canManage && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={deleteHandler}
                  className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                >
                  Delete Case Record
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisplayCaseDetails;
