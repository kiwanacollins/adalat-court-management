import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  Pending: 'bg-stone-100 text-stone-700',
  Scheduled: 'bg-amber-100 text-amber-700',
  Adjourned: 'bg-amber-100 text-amber-700',
  Concluded: 'bg-green-100 text-green-700',
  Dismissed: 'bg-red-100 text-red-700',
};

export default function CaseStatusActions({ caseDetail, userRole }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAdjournForm, setShowAdjournForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [adjournNote, setAdjournNote] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCourtroom, setNewCourtroom] = useState(caseDetail.courtroom || '');

  const canAct = userRole === 'magistrate' || userRole === 'clerk';
  const { status, uid } = caseDetail;

  async function updateStatus(new_status, extra = {}) {
    setLoading(true);
    const toastId = toast.loading('Updating status...');
    try {
      const res = await fetch('/api/case/updatestatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, new_status, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.dismiss(toastId);
        toast.error(data.message || 'Update failed');
      } else {
        toast.dismiss(toastId);
        toast.success(data.message);
        router.replace(router.asPath);
      }
    } catch {
      toast.dismiss(toastId);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (!canAct) return null;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        {/* Pending → Schedule */}
        {status === 'Pending' && (
          <button
            onClick={() => { setShowScheduleForm(!showScheduleForm); setShowAdjournForm(false); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Schedule Hearing
          </button>
        )}

        {/* Adjourned → Reschedule */}
        {status === 'Adjourned' && (
          <button
            onClick={() => { setShowScheduleForm(!showScheduleForm); setShowAdjournForm(false); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Reschedule
          </button>
        )}

        {/* Scheduled / Adjourned → Adjourn */}
        {(status === 'Scheduled') && (
          <button
            onClick={() => { setShowAdjournForm(!showAdjournForm); setShowScheduleForm(false); }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Adjourn
          </button>
        )}

        {/* Scheduled / Adjourned → Conclude */}
        {(status === 'Scheduled' || status === 'Adjourned') && (
          <button
            disabled={loading}
            onClick={() => updateStatus('Concluded')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Mark Concluded
          </button>
        )}

        {/* Any active → Dismiss */}
        {(status === 'Pending' || status === 'Scheduled' || status === 'Adjourned') && (
          <button
            disabled={loading}
            onClick={() => {
              if (confirm('Are you sure you want to dismiss this case?')) {
                updateStatus('Dismissed');
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>

      {/* Schedule / Reschedule form */}
      {showScheduleForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <h4 className="font-semibold text-slate-700 text-sm">Set Hearing Date &amp; Time</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Date *</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="block w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Time (08:00–17:00) *</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="block w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Courtroom</label>
              <select
                value={newCourtroom}
                onChange={(e) => setNewCourtroom(e.target.value)}
                className="block w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">— Select —</option>
                <option value="Courtroom 1">Courtroom 1</option>
                <option value="Courtroom 2">Courtroom 2</option>
                <option value="Courtroom 3">Courtroom 3</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              disabled={loading || !newDate || !newTime}
              onClick={() => {
                const [h] = newTime.split(':').map(Number);
                if (h < 8 || h >= 17) { toast.error('Time must be 08:00–17:00'); return; }
                if (newDate < new Date().toISOString().split('T')[0]) { toast.error('Date cannot be in the past'); return; }
                updateStatus('Scheduled', { hearing_date: newDate, hearing_time: newTime, courtroom: newCourtroom });
                setShowScheduleForm(false);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
            >
              Confirm Schedule
            </button>
            <button onClick={() => setShowScheduleForm(false)} className="px-4 py-2 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Adjourn form */}
      {showAdjournForm && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <h4 className="font-semibold text-amber-800 text-sm">Adjourn Case</h4>
          <div>
            <label className="text-xs font-medium text-slate-600">Reason for Adjournment</label>
            <textarea
              rows={2}
              value={adjournNote}
              onChange={(e) => setAdjournNote(e.target.value)}
              placeholder="e.g. Witness unavailable, counsel requests more time..."
              className="block w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">New Hearing Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="block w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">New Hearing Time</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="block w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              disabled={loading}
              onClick={() => {
                updateStatus('Adjourned', { note: adjournNote, hearing_date: newDate, hearing_time: newTime });
                setShowAdjournForm(false);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
            >
              Confirm Adjournment
            </button>
            <button onClick={() => setShowAdjournForm(false)} className="px-4 py-2 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { STATUS_COLORS };
