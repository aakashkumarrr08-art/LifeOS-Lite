import { NavLink } from 'react-router-dom';
import ThemeToggleButton from './ThemeToggleButton.jsx';
import useAuth from '../hooks/useAuth.js';

function DashboardTopNavbar({ onMenuToggle }) {
  const { user } = useAuth();
  const initials = user?.name
    ?.split(' ')
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
      <div className="flex min-h-[4.5rem] min-w-0 items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="inline-flex min-h-[2.75rem] shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open dashboard navigation"
            onClick={onMenuToggle}
            type="button"
          >
            Menu
          </button>
          <div className="min-w-0">
            <p className="hidden text-xs font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400 sm:block">
              LifeOS Lite
            </p>
            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950 sm:text-xl dark:text-white">
              Welcome back, {user?.name || 'Student'}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <NavLink
            aria-label="Open your profile"
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-500/20 dark:text-cyan-200 sm:inline-flex"
            title="Profile"
            to="/profile"
          >
            {initials || 'LL'}
          </NavLink>
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}

export default DashboardTopNavbar;
