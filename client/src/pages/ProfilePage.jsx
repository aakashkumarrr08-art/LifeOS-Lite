import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../hooks/useAuth.js';

function ProfilePage() {
  const navigate = useNavigate();
  const { logout, refreshProfile, user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');

  const joinedOn = user?.createdAt
    ? new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(user.createdAt))
    : 'Not available';

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshProfile();
      setRefreshMessage('Profile refreshed successfully.');
    } catch {
      setRefreshMessage('Unable to refresh profile right now.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-8 px-8 py-10 lg:px-10">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-300">
              Protected Route
            </span>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Welcome, {user?.name}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                This page is available only after successful authentication and JWT verification.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Full Name</p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{user?.name}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Email Address</p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{user?.email}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Member Since</p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{joinedOn}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">API Endpoint</p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                /api/auth/profile
              </p>
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-8 text-white shadow-soft dark:border-slate-800">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
            Session Actions
          </p>
          <div className="mt-6 space-y-4">
            <button className="primary-button w-full justify-center" disabled={isRefreshing} onClick={handleRefresh} type="button">
              {isRefreshing ? 'Refreshing...' : 'Refresh Profile'}
            </button>
            <Link className="secondary-button w-full justify-center" to="/dashboard">
              Back to Dashboard
            </Link>
            <button className="secondary-button w-full justify-center border-white/15 bg-white/10 text-white hover:bg-white/15" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
          {refreshMessage ? <p className="mt-4 text-sm text-cyan-100">{refreshMessage}</p> : null}
        </div>

        <div className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
            Authentication Notes
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <li>Passwords are hashed with bcrypt before storing in MongoDB.</li>
            <li>JWT tokens are attached automatically by the Axios request interceptor.</li>
            <li>The backend auth middleware protects this route using the Bearer token.</li>
            <li>The dashboard uses its own protected `/api/dashboard` endpoint for demo statistics.</li>
          </ul>
        </div>
      </aside>
    </section>
  );
}

export default ProfilePage;
