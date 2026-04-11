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

const cellInput = 'w-full rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent';

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
      <tr className="bg-blue-50 border-l-4 border-blue-400">
        {/* Case No — read-only */}
        <td className="px-4 py-3 text-xs text-slate-500 font-mono">{c.case_number || `#${number + 1}`}</td>

        {/* Case Type */}
        <td className="px-4 py-3">
          <select name="case_type" value={form.case_type} onChange={handleChange} className={cellInput}>
            {CASE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </td>

        {/* Complainant */}
        <td className="px-4 py-3">
          <input
            name="complainant_name"
            value={form.complainant_name}
            onChange={handleChange}
            className={cellInput}
            placeholder="Complainant name"
          />
        </td>

        {/* Hearing Date */}
        <td className="px-4 py-3">
          <input
            type="date"
            name="hearing_date"
            value={form.hearing_date}
            onChange={handleChange}
            className={cellInput}
          />
        </td>

        {/* Status — read-only */}
        <td className="px-4 py-3">
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>
            {c.status || 'Pending'}
          </span>
        </td>

        {/* Priority */}
        <td className="px-4 py-3">
          <select name="priority" value={form.priority} onChange={handleChange} className={cellInput}>
            <option value="Normal">Normal</option>
            <option value="Urgent">Urgent</option>
          </select>
        </td>

        {/* Save / Cancel */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              {saving ? '…' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="text-slate-500 hover:text-slate-700 text-xs font-medium px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
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
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/${c.uid}`}>
            <a className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors">
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
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 transition-all p-1 rounded-md hover:bg-slate-100"
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
