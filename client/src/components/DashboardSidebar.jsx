import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

const navigationItems = [
  { label: 'Dashboard', description: 'Overview and insights', to: '/dashboard' },
  { label: 'Study Planner', description: 'Schedule focused study sessions', to: '/study-planner' },
  { label: 'Task Manager', description: 'Plan and complete tasks', to: '/tasks' },
  { label: 'Attendance', description: 'Track subject eligibility', to: '/attendance' },
  { label: 'Analytics', description: 'Review progress and trends', to: '/analytics' },
  { label: 'AI Assistant', description: 'Get tailored study guidance', to: '/ai-assistant' },
  { label: 'Profile', description: 'Student account details', to: '/profile' },
];

const workspaceItems = ['Tasks', 'Attendance', 'Study Plans', 'Analytics'];

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
        className={`fixed inset-y-0 left-0 z-50 flex min-w-0 w-[min(18.5rem,calc(100vw-1rem))] flex-col overflow-y-auto border-r border-slate-200/70 bg-white/90 px-4 py-5 shadow-2xl backdrop-blur-xl transition duration-300 dark:border-slate-800 dark:bg-slate-950/95 sm:px-5 lg:static lg:z-auto lg:w-[280px] lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-600 dark:text-cyan-400">
              LifeOS Lite
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
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

        <div className="mt-6 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-4 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-base font-semibold text-white">
              {initials || 'LL'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold" title={user?.name}>{user?.name || 'LifeOS Student'}</p>
              <p className="mt-1 truncate text-xs leading-5 text-cyan-100/90" title={user?.email}>{user?.email || 'student@lifeos.app'}</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-slate-100">
            Keep your tasks, attendance, study plan, and analytics in one focused workspace.
          </div>
        </div>

        <nav aria-label="Dashboard navigation" className="mt-6 space-y-2">
          {navigationItems.map((item) => (
            <NavLink key={item.to} className={navigationLinkClass} onClick={onClose} to={item.to}>
              <p className="text-sm font-semibold leading-5">{item.label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</p>
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 rounded-[1.5rem] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
            Available Modules
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {workspaceItems.map((item) => (
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
          className="secondary-button mt-6 w-full justify-center lg:mt-auto"
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
