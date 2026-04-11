import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

function NotificationItem({ notif }) {
  const icons = {
    hearing_scheduled: '📅',
    hearing_adjourned: '⏰',
    status_changed: '🔄',
  };
  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${notif.read ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-100'}`}>
      <span className="text-xl flex-shrink-0">{icons[notif.type] || '🔔'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700">{notif.message}</p>
        <p className="text-xs text-slate-400 mt-1">
          {new Date(notif.created_at).toLocaleString('en-UG')}
        </p>
      </div>
      {!notif.read && (
        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
      )}
    </div>
  );
}

function UpcomingAlert({ c }) {
  const daysUntil = Math.ceil(
    (new Date(c.hearing_date) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const urgency = daysUntil <= 1 ? 'bg-red-50 border-red-200' : daysUntil <= 3 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200';
  return (
    <Link href={`/dashboard/${c.uid}`}>
      <a className={`flex items-center gap-3 p-4 rounded-xl border ${urgency} hover:shadow-sm transition-shadow`}>
        <span className="text-2xl">📅</span>
        <div>
          <p className="text-sm font-semibold text-slate-800">{c.case_number} — {c.case_type}</p>
          <p className="text-xs text-slate-500">
            Hearing in {daysUntil} day{daysUntil !== 1 ? 's' : ''}: {c.hearing_date}{c.hearing_time ? ' at ' + c.hearing_time : ''}
          </p>
        </div>
      </a>
    </Link>
  );
}

function NotificationsPage({ upcoming, notifications }) {
  const router = useRouter();
  const unread = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    const toastId = toast.loading('Marking all as read...');
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark-all-read' }),
    });
    toast.dismiss(toastId);
    toast.success('All marked as read');
    router.replace(router.asPath);
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            {unread > 0 && (
              <p className="text-sm text-slate-500">{unread} unread</p>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Upcoming hearings */}
        {upcoming.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Upcoming Hearings (Next 7 Days)
            </h2>
            <div className="space-y-2">
              {upcoming.map((c) => (
                <UpcomingAlert key={c.uid} c={c} />
              ))}
            </div>
          </section>
        )}

        {/* Stored notifications */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Recent Activity
          </h2>
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <p className="text-slate-400 text-sm">No notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <NotificationItem key={n._id} notif={n} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

import { connectToDatabase } from '@/helpers/db-utils';
import { getSession } from 'next-auth/client';

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });
  if (!session) {
    return { redirect: { destination: '/auth', permanent: false } };
  }

  try {
    const client = await connectToDatabase();
    const db = client.db();

    const role = session.user.role || 'litigant';
    const userName = session.user.name || session.user.email;

    const today = new Date().toISOString().split('T')[0];
    const inSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const upcomingQuery = {
      hearing_date: { $gte: today, $lte: inSevenDays },
      status: { $in: ['Scheduled', 'Adjourned'] },
    };
    if (role === 'litigant') upcomingQuery.registered_by = session.user.email;
    if (role === 'magistrate') upcomingQuery.assigned_magistrate = userName;

    const upcoming = await db.collection('cases').find(upcomingQuery).toArray();

    const notifQuery = { $or: [{ for_role: 'all' }, { for_role: role }] };
    if (role === 'magistrate') notifQuery.$or.push({ for_name: userName });

    const notifications = await db
      .collection('notifications')
      .find(notifQuery)
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    client.close();

    return {
      props: {
        upcoming: JSON.parse(JSON.stringify(upcoming)),
        notifications: JSON.parse(JSON.stringify(notifications)),
      },
    };
  } catch {
    return {
      props: { upcoming: [], notifications: [] },
    };
  }
}

export default function NotificationsPageWrapper(props) {
  return (
    <>
      <Head>
        <title>Notifications — E-Judiciary CMS</title>
      </Head>
      <NotificationsPage {...props} />
    </>
  );
}
