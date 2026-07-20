import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../hooks/useAuth.js';

function ProfilePage() {
  const navigate = useNavigate();
  const { logout, refreshProfile, user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');
  const initials = user?.name
    ?.split(' ')
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const joinedOn = user?.createdAt
    ? new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
      }).format(new Date(user.createdAt))
    : 'Not available';

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshProfile();
      setRefreshMessage('Profile refreshed successfully.');
    } catch {
      setRefreshMessage('Unable to refresh your profile right now.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <section className="space-y-6">
      <div className="page-hero">
        <div className="page-hero-content lg:items-center">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] bg-white/10 text-xl font-semibold text-white sm:h-20 sm:w-20 sm:text-2xl">
              {initials || 'LL'}
            </div>
            <div className="min-w-0">
              <span className="page-eyebrow">Your profile</span>
              <h2 className="mt-3 truncate text-2xl font-semibold tracking-tight sm:text-3xl">{user?.name || 'LifeOS Student'}</h2>
              <p className="mt-2 break-words text-sm leading-6 text-slate-200">{user?.email}</p>
            </div>
          </div>
          <button className="primary-button w-full border border-white/10 bg-white text-slate-950 hover:bg-slate-100 sm:w-auto dark:bg-white dark:text-slate-950" disabled={isRefreshing} onClick={handleRefresh} type="button">
            {isRefreshing ? 'Refreshing...' : 'Refresh profile'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="dashboard-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Account details</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Your student workspace</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Keep your account information accessible while you plan, track, and reflect on your academic work.</p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Full name</dt>
              <dd className="mt-2 break-words text-lg font-semibold leading-7 text-slate-950 dark:text-white">{user?.name || 'Not available'}</dd>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Email address</dt>
              <dd className="mt-2 break-words text-base font-semibold leading-7 text-slate-950 dark:text-white">{user?.email || 'Not available'}</dd>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60 sm:col-span-2">
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Member since</dt>
              <dd className="mt-2 text-lg font-semibold leading-7 text-slate-950 dark:text-white">{joinedOn}</dd>
            </div>
          </dl>
        </article>

        <aside className="space-y-6">
          <div className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-5 text-white shadow-soft sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Workspace actions</p>
            <p className="mt-3 text-lg font-semibold leading-7">Stay in control of your learning space.</p>
            <div className="mt-5 grid gap-3">
              <Link className="secondary-button w-full border-white/15 bg-white/10 text-white hover:bg-white/15" to="/dashboard">
                Back to dashboard
              </Link>
              <button className="secondary-button w-full border-white/15 bg-white/10 text-white hover:bg-white/15" onClick={handleLogout} type="button">
                Logout
              </button>
            </div>
            {refreshMessage ? <p aria-live="polite" className="mt-4 text-sm leading-6 text-cyan-100">{refreshMessage}</p> : null}
          </div>

          <div className="dashboard-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Your focus</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <li>Keep upcoming tasks visible and manageable.</li>
              <li>Protect attendance with timely subject updates.</li>
              <li>Turn planned sessions into consistent study habits.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default ProfilePage;
