import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

const authFeatures = [
  {
    title: 'Connected Workspace',
    description: 'Tasks, attendance, study sessions, analytics, and insights live together in one personal workspace.',
  },
  {
    title: 'Personal Space',
    description: 'Your account keeps your academic routine organized and ready whenever you return.',
  },
  {
    title: 'Rule-Based Study Assistant',
    description: 'Transparent recommendations turn your own workload, study schedule, and attendance into practical next actions.',
  },
];

function HomePage() {
  const { authReady, isAuthenticated, user } = useAuth();

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-white shadow-soft lg:rounded-[2rem] dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:px-10 lg:py-10">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-sm font-medium text-cyan-700 dark:text-cyan-300">
              Full Student Productivity Workspace
            </div>
            <div className="space-y-4">
              <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                Plan, track, and improve your academic work from one secure dashboard.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                Manage tasks, attendance, and study sessions while analytics and AI insights turn your activity into clear next steps.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              {isAuthenticated ? (
                <>
                  <Link className="primary-button" to="/dashboard">
                    Open Dashboard
                  </Link>
                  <Link className="secondary-button" to="/tasks">
                    Manage Tasks
                  </Link>
                  <Link className="secondary-button" to="/ai-assistant">
                    Open AI Assistant
                  </Link>
                  <span className="inline-flex max-w-full items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                    Signed in as <span className="ml-1 truncate">{user?.name}</span>
                  </span>
                </>
              ) : (
                <>
                  <Link className="primary-button" to="/register">
                    Create Account
                  </Link>
                  <Link className="secondary-button" to="/login">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-slate-950 p-5 text-slate-100 sm:p-6 dark:bg-slate-800">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
              Current Status
            </p>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">Account access</p>
                <p className="mt-2">
                  {authReady
                    ? isAuthenticated
                      ? 'Your personal dashboard is ready.'
                      : 'Sign in to open your personal workspace.'
                    : 'Checking your session...'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">Everything in one place</p>
                <p className="mt-2">
                  Plan tasks, track attendance, schedule study sessions, and explore insights without switching tools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {authFeatures.map((feature) => (
          <article
            key={feature.title}
            className="dashboard-panel"
          >
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{feature.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HomePage;
