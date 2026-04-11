import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import CaseStatusActions, { STATUS_COLORS } from './CaseStatusActions';

const PRIORITY_COLORS = {
  Urgent: 'bg-red-100 text-red-700',
  Normal: 'bg-slate-100 text-slate-600',
};
const CASE_TYPES = ['Criminal', 'Civil', 'Land Dispute', 'Family', 'Others'];
const COURTROOMS = ['Courtroom 1', 'Courtroom 2', 'Courtroom 3'];

const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition';
const labelCls = 'text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block';

function SectionHeader({ title, canEdit, editing, onEdit, onSave, onCancel, saving }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      {canEdit && !editing && (
        <button onClick={onEdit} className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit
        </button>
      )}
      {canEdit && editing && (
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-700 text-xs font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function DisplayCaseDetails({ caseDetail: initial, userRole }) {
  const router = useRouter();
  const canManage = userRole === 'magistrate' || userRole === 'clerk';

  // Local mutable copy of the case
  const [data, setData] = useState(initial);

  // Per-section edit state
  const [editSection, setEditSection] = useState(null); // 'info' | 'parties' | 'schedule'
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  function startEdit(section, fields) {
    setForm(fields);
    setEditSection(section);
  }

  function cancelEdit() { setEditSection(null); setForm({}); }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function saveSection() {
    setSaving(true);
    try {
      const res = await fetch('/api/case/updatecase', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: data.uid, ...form }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.message || 'Save failed'); return; }
      setData((prev) => ({ ...prev, ...form }));
      setEditSection(null);
      setForm({});
      toast.success('Changes saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function deleteHandler() {
    if (!confirm('Are you sure you want to permanently delete this case? This cannot be undone.')) return;
    const toastId = toast.loading('Deleting case…');
    const res = await fetch('/api/case/deletecase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data.uid),
    });
    toast.dismiss(toastId);
    if (res.ok) { toast.success('Case deleted'); router.replace('/dashboard'); }
    else toast.error('Failed to delete case');
  }

  const statusColor = STATUS_COLORS[data.status] || 'bg-slate-100 text-slate-700';
  const priorityColor = PRIORITY_COLORS[data.priority] || PRIORITY_COLORS.Normal;
  const hearingFormatted = data.hearing_date
    ? new Date(data.hearing_date).toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="bg-[#0f172a] rounded-2xl px-6 py-5 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Case Number</p>
              <h1 className="text-white text-2xl font-bold">{data.case_number || data.uid}</h1>
              <p className="text-slate-400 text-sm mt-1">Filed: {data.filing_date || '—'}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                {data.status || 'Pending'}
              </span>
              {/* Priority: inline-editable directly from header */}
              {canManage ? (
                <select
                  value={data.priority || 'Normal'}
                  onChange={async (e) => {
                    const priority = e.target.value;
                    const res = await fetch('/api/case/updatecase', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ uid: data.uid, priority }),
                    });
                    if (res.ok) { setData((p) => ({ ...p, priority })); toast.success('Priority updated'); }
                    else toast.error('Failed to update priority');
                  }}
                  className="rounded-full text-xs font-semibold px-3 py-1 bg-slate-700 text-slate-100 border-0 cursor-pointer focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="Normal">Normal Priority</option>
                  <option value="Urgent">Urgent Priority</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColor}`}>
                  {data.priority || 'Normal'} Priority
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* ── Section: Case Details ── */}
          <div className="px-6 py-5 border-b border-slate-100">
            <SectionHeader
              title="Case Details"
              canEdit={canManage}
              editing={editSection === 'info'}
              saving={saving}
              onEdit={() => startEdit('info', { case_type: data.case_type || '', case_description: data.case_description || '' })}
              onSave={saveSection}
              onCancel={cancelEdit}
            />

            {editSection === 'info' ? (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Case Type</label>
                  <select name="case_type" value={form.case_type} onChange={handleChange} className={inputCls}>
                    {CASE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea name="case_description" rows={3} value={form.case_description} onChange={handleChange} className={inputCls} />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={labelCls}>Case Type</p>
                    <p className="text-slate-800 mt-0.5 text-sm">{data.case_type || '—'}</p>
                  </div>
                  <div>
                    <p className={labelCls}>Registered By</p>
                    <p className="text-slate-800 mt-0.5 text-sm">{data.registered_by || '—'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className={labelCls}>Description</p>
                  <p className="text-slate-700 mt-1 text-sm leading-relaxed">{data.case_description || '—'}</p>
                </div>
              </>
            )}
          </div>

          {/* ── Section: Parties ── */}
          <div className="px-6 py-5 border-b border-slate-100">
            <SectionHeader
              title="Parties Involved"
              canEdit={canManage}
              editing={editSection === 'parties'}
              saving={saving}
              onEdit={() => startEdit('parties', {
                complainant_name: data.complainant_name || '',
                complainant_contact: data.complainant_contact || '',
                respondent_name: data.respondent_name || '',
                respondent_contact: data.respondent_contact || '',
              })}
              onSave={saveSection}
              onCancel={cancelEdit}
            />

            {editSection === 'parties' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Complainant Name</label>
                  <input name="complainant_name" value={form.complainant_name} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Complainant Contact</label>
                  <input name="complainant_contact" value={form.complainant_contact} onChange={handleChange} className={inputCls} placeholder="Phone or email" />
                </div>
                <div>
                  <label className={labelCls}>Respondent Name</label>
                  <input name="respondent_name" value={form.respondent_name} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Respondent Contact</label>
                  <input name="respondent_contact" value={form.respondent_contact} onChange={handleChange} className={inputCls} placeholder="Phone or email" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Complainant / Plaintiff</p>
                  <p className="text-slate-800 font-medium">{data.complainant_name || '—'}</p>
                  {data.complainant_contact && <p className="text-slate-500 text-sm mt-0.5">{data.complainant_contact}</p>}
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Respondent / Defendant</p>
                  <p className="text-slate-800 font-medium">{data.respondent_name || '—'}</p>
                  {data.respondent_contact && <p className="text-slate-500 text-sm mt-0.5">{data.respondent_contact}</p>}
                </div>
              </div>
            )}
          </div>

          {/* ── Section: Hearing Schedule ── */}
          <div className="px-6 py-5 border-b border-slate-100">
            <SectionHeader
              title="Hearing Schedule"
              canEdit={canManage}
              editing={editSection === 'schedule'}
              saving={saving}
              onEdit={() => startEdit('schedule', {
                hearing_date: data.hearing_date || '',
                hearing_time: data.hearing_time || '',
                courtroom: data.courtroom || '',
                assigned_magistrate: data.assigned_magistrate || '',
              })}
              onSave={saveSection}
              onCancel={cancelEdit}
            />

            {editSection === 'schedule' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Hearing Date</label>
                  <input type="date" name="hearing_date" value={form.hearing_date} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Hearing Time</label>
                  <input type="time" min="08:00" max="17:00" name="hearing_time" value={form.hearing_time} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Courtroom</label>
                  <select name="courtroom" value={form.courtroom} onChange={handleChange} className={inputCls}>
                    <option value="">Not assigned</option>
                    {COURTROOMS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Assigned Magistrate</label>
                  <input name="assigned_magistrate" value={form.assigned_magistrate} onChange={handleChange} className={inputCls} placeholder="Magistrate name" />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className={labelCls}>Hearing Date</p>
                    <p className="text-slate-800 mt-0.5 text-sm">{hearingFormatted || data.hearing_date || 'Not set'}</p>
                  </div>
                  <div>
                    <p className={labelCls}>Hearing Time</p>
                    <p className="text-slate-800 mt-0.5 text-sm">{data.hearing_time || 'Not set'}</p>
                  </div>
                  <div>
                    <p className={labelCls}>Courtroom</p>
                    <p className="text-slate-800 mt-0.5 text-sm">{data.courtroom || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className={labelCls}>Assigned Magistrate</p>
                  <p className="text-slate-800 mt-0.5 text-sm">{data.assigned_magistrate || 'Not assigned'}</p>
                </div>
              </>
            )}
          </div>

          {/* Status history — read-only */}
          {data.status_history && data.status_history.length > 0 && (
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Status History</h2>
              <ol className="relative border-l border-slate-200 space-y-4 ml-3">
                {data.status_history.map((entry, i) => (
                  <li key={i} className="ml-4">
                    <div className="absolute -left-1.5 mt-1.5 w-3 h-3 bg-blue-500 rounded-full" />
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
            <CaseStatusActions caseDetail={data} userRole={userRole} />
            {canManage && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button onClick={deleteHandler} className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
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
