const scoreStyles = {
  Excellent: {
    badge: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-100',
    ring: 'from-emerald-400 via-lime-300 to-cyan-300',
  },
  Good: {
    badge: 'border-cyan-400/30 bg-cyan-400/15 text-cyan-100',
    ring: 'from-cyan-400 via-sky-300 to-indigo-300',
  },
  Average: {
    badge: 'border-amber-400/30 bg-amber-400/15 text-amber-100',
    ring: 'from-amber-300 via-orange-300 to-yellow-200',
  },
  'Needs Improvement': {
    badge: 'border-rose-400/30 bg-rose-400/15 text-rose-100',
    ring: 'from-rose-400 via-red-300 to-orange-300',
  },
};

function AnalyticsCard({ description, score, summary }) {
  const style = scoreStyles[summary] || scoreStyles['Needs Improvement'];

  return (
    <article className="relative min-h-[18rem] min-w-0 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-5 text-white shadow-soft sm:p-6">
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative flex h-full min-w-0 flex-col justify-between gap-6 2xl:flex-row 2xl:items-center">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Productivity Score</p>
          <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">Your academic momentum</h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">{description}</p>
          <span className={`mt-5 inline-flex w-fit max-w-full rounded-full border px-3 py-1 text-sm font-semibold leading-5 ${style.badge}`}>
            {summary}
          </span>
        </div>

        <div className={`flex h-28 w-28 shrink-0 self-center items-center justify-center rounded-full bg-gradient-to-br ${style.ring} p-1 shadow-lg sm:h-32 sm:w-32 2xl:self-auto`}>
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950 text-center">
            <span className="text-4xl font-semibold tracking-tight">{score}</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">out of 100</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default AnalyticsCard;
