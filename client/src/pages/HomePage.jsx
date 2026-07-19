import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

const authFeatures = [
  {
    title: 'Register',
    description: 'Create a student account with validated inputs and hashed passwords.',
  },
  {
    title: 'Login',
    description: 'Authenticate securely and store the JWT token for future protected requests.',
  },
  {
    title: 'Profile',
    description: 'Access a protected page powered by token-based authorization middleware.',
  },
];

function HomePage() {
  const { authReady, isAuthenticated, user } = useAuth();

  return (
    <section className="space-y-10">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-10 px-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-sm font-medium text-cyan-700 dark:text-cyan-300">
              Authentication Module
            </div>
            <div className="space-y-4">
              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                LifeOS Lite now includes a complete student authentication workflow.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                This phase adds secure registration, login, JWT-based profile access, logout, and
                responsive React pages without touching the dashboard or other modules.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <>
                  <Link className="primary-button" to="/profile">
                    Open Profile
                  </Link>
                  <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">
                    Signed in as {user?.name}
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

          <div className="rounded-[1.5rem] bg-slate-950 p-6 text-slate-100 dark:bg-slate-800">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
              Current Status
            </p>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">Session State</p>
                <p className="mt-2">
                  {authReady
                    ? isAuthenticated
                      ? 'Authenticated and ready for protected routes.'
                      : 'No user logged in yet.'
                    : 'Checking stored authentication token...'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">Backend API</p>
                <p className="mt-2">Available endpoints: register, login, and protected profile.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {authFeatures.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900"
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

