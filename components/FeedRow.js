import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { STATUS_COLORS } from './CaseStatusActions';

const CASE_TYPES = ['Criminal', 'Civil', 'Land Dispute', 'Family', 'Others'];

const caseTypeColors = {
  Civil: 'bg-blue-100 text-blue-700',
  Criminal: 'bg-red-100 text-red-700',
  'Land Dispute': 'bg-yellow-100 text-yellow-700',
  Family: 'bg-purple-100 text-purple-700',
  Others: 'bg-slate-100 text-slate-600',
};

const cellInput = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-blue-500/20';

function FeedRow({ case: c, number, canEdit, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    case_type: c.case_type || '',
    complainant_name: c.complainant_name || '',
    hearing_date: c.hearing_date || '',
    priority: c.priority || 'Normal',
  });

  // Keep form in sync if parent refreshes case data
  const display = editing ? form : {
    case_type: c.case_type || '',
    complainant_name: c.complainant_name || '',
    hearing_date: c.hearing_date || '',
    priority: c.priority || 'Normal',
  };

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/case/updatecase', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: c.uid, ...form }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || 'Save failed'); return; }
      toast.success('Case updated');
      setEditing(false);
      if (onUpdate) onUpdate(c.uid, form);
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm({
      case_type: c.case_type || '',
      complainant_name: c.complainant_name || '',
      hearing_date: c.hearing_date || '',
      priority: c.priority || 'Normal',
    });
    setEditing(false);
  }

  const caseType = editing ? form.case_type : (c.case_type || '');
  const badgeColor = caseTypeColors[caseType] || 'bg-slate-100 text-slate-600';
  const statusColor = STATUS_COLORS[c.status] || 'bg-slate-100 text-slate-600';
  const formattedDate = c.hearing_date
    ? new Date(c.hearing_date).toLocaleDateString('en-UG', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  if (editing) {
    return (
      <tr className="border-l-4 border-blue-500 bg-slate-50/90">
        {/* Case No — read-only */}
        <td className="px-4 py-4 align-top text-xs font-medium text-slate-500 font-mono">{c.case_number || `#${number + 1}`}</td>

        {/* Case Type */}
        <td className="px-4 py-4 align-top">
          <select name="case_type" value={form.case_type} onChange={handleChange} className={cellInput}>
            {CASE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </td>

        {/* Complainant */}
        <td className="px-4 py-4 align-top">
          <input
            name="complainant_name"
            value={form.complainant_name}
            onChange={handleChange}
            className={cellInput}
            placeholder="Complainant name"
          />
        </td>

        {/* Hearing Date */}
        <td className="px-4 py-4 align-top">
          <input
            type="date"
            name="hearing_date"
            value={form.hearing_date}
            onChange={handleChange}
            className={cellInput}
          />
        </td>

        {/* Status — read-only */}
        <td className="px-4 py-4 align-top">
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>
            {c.status || 'Pending'}
          </span>
        </td>

        {/* Priority */}
        <td className="px-4 py-4 align-top">
          <select name="priority" value={form.priority} onChange={handleChange} className={cellInput}>
            <option value="Normal">Normal</option>
            <option value="Urgent">Urgent</option>
          </select>
        </td>

        {/* Save / Cancel */}
        <td className="px-4 py-4 align-top">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-transform duration-200 hover:scale-[1.02] hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? '…' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="rounded-full px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="group transition-colors hover:bg-slate-50/80">
      <td className="px-4 py-4 text-sm font-medium text-slate-500 font-mono">{c.case_number || `#${number + 1}`}</td>
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
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/${c.uid}`}>
            <a className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-500">
              View
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </Link>
          {canEdit && (
            <button
              onClick={() => setEditing(true)}
              title="Edit row"
              className="rounded-full p-2 text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default FeedRow;
