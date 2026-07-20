const priorityClasses = {
  High: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-200',
  Medium: 'border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-200',
  Low: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
};

function WeeklyRecommendations({ weeklyRecommendations }) {
  return (
    <article className="dashboard-panel">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Weekly Recommendations</p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Your next academic focus</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{weeklyRecommendations.summary}</p>
      <div className="mt-6 space-y-3">
        {weeklyRecommendations.recommendations.map((recommendation) => (
          <div className={`rounded-2xl border p-4 ${priorityClasses[recommendation.priority] || priorityClasses.Medium}`} key={recommendation.id}>
            <p className="font-semibold">{recommendation.title}</p>
            <p className="mt-2 text-sm leading-6">{recommendation.message}</p>
            <p className="mt-3 text-sm font-semibold">Action: {recommendation.action}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default WeeklyRecommendations;
