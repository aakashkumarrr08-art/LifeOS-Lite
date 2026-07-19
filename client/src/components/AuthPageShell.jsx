import { Link } from 'react-router-dom';

const highlights = [
  'JWT-based session handling for protected routes',
  'Hashed passwords with secure backend validation',
  'Clean MVC structure that is easy to explain in viva',
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
    <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-8 text-white shadow-soft dark:border-slate-800">
        <div className="flex h-full flex-col justify-between gap-10">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
              {badge}
            </span>
            <div className="space-y-4">
              <h2 className="max-w-xl text-4xl font-semibold tracking-tight">{title}</h2>
              <p className="max-w-xl text-base leading-7 text-slate-300">{description}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
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

      <div className="auth-card mx-auto flex w-full max-w-xl flex-col justify-center">
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

