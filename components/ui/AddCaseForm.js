import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 } from 'uuid';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/client';

const CASE_TYPES = ['Criminal', 'Civil', 'Land Dispute', 'Family', 'Others'];
const COURTROOMS = ['Courtroom 1', 'Courtroom 2', 'Courtroom 3'];

export default function AddCaseForm() {
  const router = useRouter();
  const [session] = useSession();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const [magistrates, setMagistrates] = useState([]);
  const [conflictWarning, setConflictWarning] = useState(null);

  useEffect(() => {
    fetch('/api/users/magistrates')
      .then((r) => r.json())
      .then((d) => setMagistrates(d.magistrates || []))
      .catch(() => {});
  }, []);

  const hearingDate = watch('hearing_date');
  const hearingTime = watch('hearing_time');
  const assignedMagistrate = watch('assigned_magistrate');
  const courtroom = watch('courtroom');

  // Live conflict check when scheduling fields change
  useEffect(() => {
    if (!hearingDate || !hearingTime) { setConflictWarning(null); return; }

    const checkConflict = async () => {
      try {
        const res = await fetch('/api/schedule/check-conflict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            magistrate: assignedMagistrate,
            date: hearingDate,
            time: hearingTime,
            courtroom,
          }),
        });
        const data = await res.json();
        if (data.hasConflict) {
          setConflictWarning(data.conflicts.join(' | '));
        } else {
          setConflictWarning(null);
        }
      } catch {
        setConflictWarning(null);
      }
    };

    const timer = setTimeout(checkConflict, 500);
    return () => clearTimeout(timer);
  }, [hearingDate, hearingTime, assignedMagistrate, courtroom]);

  async function submitHandler(data) {
    // Business hour validation
    if (data.hearing_date && data.hearing_time) {
      const dayOfWeek = new Date(data.hearing_date).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        toast.error('Hearings cannot be scheduled on weekends');
        return;
      }
      const [h] = data.hearing_time.split(':').map(Number);
      if (h < 8 || h >= 17) {
        toast.error('Hearings must be between 08:00 and 17:00');
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      if (data.hearing_date < today) {
        toast.error('Hearing date cannot be in the past');
        return;
      }
    }

    const toastId = toast.loading('Registering case...');
    try {
      const payload = { ...data, uid: v4() };
      const res = await fetch('/api/case/addcase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      toast.dismiss(toastId);
      if (!res.ok) {
        toast.error(result.message || 'Failed to register case');
        return;
      }
      toast.success(`Case ${result.case_number} registered successfully`);
      router.push('/dashboard');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('An unexpected error occurred');
    }
  }

  const inputClass = 'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';
  const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5';
  const errorClass = 'text-red-500 text-xs mt-1';

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-8">

      {/* Conflict warning banner */}
      {conflictWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-amber-700 font-semibold text-sm">Scheduling Conflict Detected</p>
            <p className="text-amber-600 text-xs mt-0.5">{conflictWarning}</p>
          </div>
        </div>
      )}

      {/* Case information */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Case Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Case Type *</label>
            <select className={inputClass} {...register('case_type', { required: 'Case type is required' })}>
              <option value="">Select type...</option>
              {CASE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.case_type && <p className={errorClass}>{errors.case_type.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Priority</label>
            <select className={inputClass} {...register('priority')}>
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Case Description *</label>
          <textarea
            rows={3}
            className={inputClass}
            placeholder="Brief description of the case..."
            {...register('case_description', { required: 'Description is required' })}
          />
          {errors.case_description && <p className={errorClass}>{errors.case_description.message}</p>}
        </div>
      </div>

      {/* Parties */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Parties Involved</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Complainant / Plaintiff Name *</label>
            <input type="text" className={inputClass} placeholder="Full name" {...register('complainant_name', { required: 'Complainant name is required' })} />
            {errors.complainant_name && <p className={errorClass}>{errors.complainant_name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Complainant Contact</label>
            <input type="text" className={inputClass} placeholder="Phone or email" {...register('complainant_contact')} />
          </div>
          <div>
            <label className={labelClass}>Respondent / Defendant Name *</label>
            <input type="text" className={inputClass} placeholder="Full name" {...register('respondent_name', { required: 'Respondent name is required' })} />
            {errors.respondent_name && <p className={errorClass}>{errors.respondent_name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Respondent Contact</label>
            <input type="text" className={inputClass} placeholder="Phone or email" {...register('respondent_contact')} />
          </div>
        </div>
      </div>

      {/* Hearing schedule */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Hearing Schedule (Optional)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Assigned Magistrate</label>
            <select className={inputClass} {...register('assigned_magistrate')}>
              <option value="">Select magistrate...</option>
              {magistrates.map((m) => (
                <option key={m.email} value={m.name || m.email}>{m.name || m.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Hearing Date</label>
            <input type="date" className={inputClass} {...register('hearing_date')} />
          </div>
          <div>
            <label className={labelClass}>Hearing Time</label>
            <input type="time" min="08:00" max="17:00" className={inputClass} {...register('hearing_time')} />
          </div>
        </div>
        <div className="mt-4 sm:w-1/3">
          <label className={labelClass}>Courtroom</label>
          <select className={inputClass} {...register('courtroom')}>
            <option value="">Select courtroom...</option>
            {COURTROOMS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
        >
          {isSubmitting ? 'Registering...' : 'Register Case'}
        </button>
      </div>
    </form>
  );
}
