function AttendanceAlerts({ alerts }) {
  return (
    <article className="dashboard-panel">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Attendance Alerts</p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Keep eligibility protected</h3>
      <div className="mt-6 space-y-3">
        {alerts.length > 0 ? alerts.map((alert) => (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4" key={alert.subject}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-rose-800 dark:text-rose-100">{alert.subject}</p>
              <span className="rounded-full border border-rose-500/20 bg-white/40 px-3 py-1 text-sm font-semibold text-rose-700 dark:bg-slate-950/30 dark:text-rose-200">{alert.percentage}%</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-rose-700 dark:text-rose-200">{alert.message}</p>
          </div>
        )) : (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm leading-6 text-emerald-700 dark:text-emerald-200">
            No attendance alerts. All tracked subjects are at or above the 75% safety target.
          </div>
        )}
      </div>
    </article>
  );
}

export default AttendanceAlerts;
