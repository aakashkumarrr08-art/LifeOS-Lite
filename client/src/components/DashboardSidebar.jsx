import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

const navigationItems = [
  { label: 'Dashboard', description: 'Overview and insights', to: '/dashboard' },
  { label: 'Task Manager', description: 'Plan and complete tasks', to: '/tasks' },
  { label: 'Attendance', description: 'Track subject eligibility', to: '/attendance' },
  { label: 'Profile', description: 'Student account details', to: '/profile' },
];

const upcomingItems = ['Study Planner', 'Analytics'];

function DashboardSidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();
  const initials = user?.name
    ?.split(' ')
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const navigationLinkClass = ({ isActive }) =>
    [
      'group rounded-2xl border px-4 py-3 transition duration-200',
      isActive
        ? 'border-cyan-500/30 bg-cyan-500/10 text-slate-950 dark:text-white'
        : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-900',
    ].join(' ');

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition duration-300 lg:hidden ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r border-slate-200/70 bg-white/90 px-5 py-6 shadow-2xl backdrop-blur-xl transition duration-300 dark:border-slate-800 dark:bg-slate-950/95 lg:static lg:z-auto lg:w-[280px] lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-600 dark:text-cyan-400">
              LifeOS Lite
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Dashboard
            </h2>
          </div>
          <button
            className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-300 lg:hidden"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-8 rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold text-white">
              {initials || 'LL'}
            </div>
            <div>
              <p className="text-lg font-semibold">{user?.name}</p>
              <p className="text-sm text-cyan-100/90">{user?.email}</p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100">
            Productivity sprint active with a current focus streak of 6 days.
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {navigationItems.map((item) => (
            <NavLink key={item.to} className={navigationLinkClass} onClick={onClose} to={item.to}>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 rounded-[1.5rem] border border-slate-200/70 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
            Upcoming Modules
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {upcomingItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <button
          className="secondary-button mt-auto w-full justify-center"
          onClick={logout}
          type="button"
        >
          Logout
        </button>
      </aside>
    </>
  );
}

export default DashboardSidebar;
