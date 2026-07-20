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
      <a className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-slate-950" href="#main-content">
        Skip to main content
      </a>
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-600 dark:text-cyan-400">
                Student productivity
              </p>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">LifeOS Lite</h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            <nav aria-label="Primary navigation" className="flex flex-wrap gap-2">
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

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <ThemeToggleButton />
              {authReady && isAuthenticated ? (
                <>
                  <span className="max-w-full truncate rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300 sm:max-w-[14rem]">
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

      <main className="mx-auto min-w-0 max-w-7xl px-4 py-6 sm:px-6 sm:py-8" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
