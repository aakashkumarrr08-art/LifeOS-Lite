function AiSummary({ summary }) {
  const score = summary.productivity?.productivityScore || 0;
  const level = summary.productivity?.productivityLevel || 'Needs Improvement';
  const scoreClass =
    score >= 85
      ? 'from-emerald-400 via-lime-300 to-cyan-300'
      : score >= 70
        ? 'from-cyan-400 via-sky-300 to-indigo-300'
        : score >= 50
          ? 'from-amber-300 via-orange-300 to-yellow-200'
          : 'from-rose-400 via-red-300 to-orange-300';

  return (
    <article className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 text-white shadow-soft">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">AI Summary</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight">Your rule-based study coach</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{summary.todayRecommendation}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">{summary.engine} engine</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">{level} momentum</span>
          </div>
        </div>

        <div className={`flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${scoreClass} p-1 shadow-lg`}>
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950 text-center">
            <span className="text-4xl font-semibold tracking-tight">{score}</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">productivity</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default AiSummary;
