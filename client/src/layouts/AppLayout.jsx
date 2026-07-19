import { NavLink, Outlet } from 'react-router-dom';
import ThemeToggleButton from '../components/ThemeToggleButton.jsx';
import useAuth from '../hooks/useAuth.js';

function AppLayout() {
  const { authReady, isAuthenticated, logout, user } = useAuth();

  const navigationLinkClass = ({ isActive }) =>
    [
      'rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200',
      isActive
        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
    ].join(' ');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200/70 bg-white/75 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-600 dark:text-cyan-400">
                Semester Project
              </p>
              <h1 className="text-2xl font-bold tracking-tight">LifeOS Lite</h1>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300 lg:hidden">
              Phase 3 Dashboard
            </span>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
            <nav className="flex flex-wrap gap-2">
              <NavLink className={navigationLinkClass} to="/">
                Home
              </NavLink>
              {!isAuthenticated ? (
                <>
                  <NavLink className={navigationLinkClass} to="/login">
                    Login
                  </NavLink>
                  <NavLink className={navigationLinkClass} to="/register">
                    Register
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink className={navigationLinkClass} to="/dashboard">
                    Dashboard
                  </NavLink>
                  <NavLink className={navigationLinkClass} to="/profile">
                    Profile
                  </NavLink>
                </>
              )}
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300 lg:inline-flex">
                Phase 3 Dashboard
              </span>
              <ThemeToggleButton />
              {authReady && isAuthenticated ? (
                <>
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300">
                    {user?.email}
                  </span>
                  <button className="secondary-button px-4 py-2" onClick={logout} type="button">
                    Logout
                  </button>
                </>
              ) : (
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  {authReady ? 'Guest Session' : 'Checking Session'}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
