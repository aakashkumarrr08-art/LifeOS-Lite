import { Link } from 'react-router-dom';

const highlights = [
  'One calm workspace for your study routine',
  'Plan tasks and focused study sessions',
  'See meaningful progress at a glance',
];

function AuthPageShell({
  badge,
  children,
  description,
  footerLabel,
  footerLinkText,
  footerTo,
  title,
}) {
  return (
    <section className="grid min-w-0 gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
      <div className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-5 text-white shadow-soft sm:p-8 lg:rounded-[2rem] dark:border-slate-800">
        <div className="flex h-full flex-col justify-between gap-8 lg:gap-10">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
              {badge}
            </span>
            <div className="space-y-4">
              <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{title}</h2>
              <p className="max-w-xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">{description}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm leading-6 text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-card mx-auto flex w-full min-w-0 max-w-xl flex-col justify-center">
        {children}

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          {footerLabel}{' '}
          <Link className="font-semibold text-cyan-600 hover:text-cyan-500" to={footerTo}>
            {footerLinkText}
          </Link>
        </p>
      </div>
    </section>
  );
}

export default AuthPageShell;
