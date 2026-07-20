const priorityClasses = {
  High: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-200',
  Medium: 'border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-200',
  Low: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
};

function ProductivityTips({ productivityTips }) {
  return (
    <article className="dashboard-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Productivity Tips</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Small actions, stronger momentum</h3>
        </div>
        <span className="w-fit rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
          {productivityTips.productivityScore} · {productivityTips.level}
        </span>
      </div>
      <div className="mt-6 grid gap-4">
        {productivityTips.tips.map((tip) => (
          <div className={`rounded-2xl border p-4 ${priorityClasses[tip.priority] || priorityClasses.Medium}`} key={tip.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <p className="font-semibold">{tip.title}</p>
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">{tip.priority}</span>
            </div>
            <p className="mt-2 text-sm leading-6">{tip.message}</p>
            <p className="mt-3 text-sm font-semibold">Action: {tip.action}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default ProductivityTips;
