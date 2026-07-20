const accentClasses = {
  amber: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  rose: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300',
};

function StatisticsCard({ accent = 'cyan', detail, label, value }) {
  return (
    <article className="metric-card relative">
      <div className={`absolute right-5 top-5 h-10 w-10 rounded-2xl border ${accentClasses[accent] || accentClasses.cyan}`} />
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{detail}</p>
    </article>
  );
}

export default StatisticsCard;
