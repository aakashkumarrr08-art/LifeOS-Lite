const formatPercentage = (percentage) => {
  const value = Number(percentage) || 0;
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
};

function AttendanceCard({ attendance, onDelete, onEdit }) {
  const minimumAttendance = attendance.minimumAttendance || 75;
  const percentage = Number(attendance.percentage) || 0;
  const isAtRisk = percentage < 75 || percentage < minimumAttendance;
  const progressWidth = Math.min(Math.max(percentage, 0), 100);
  const classesNeeded = attendance.classesNeeded;

  return (
    <article className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-white p-4 shadow-soft transition duration-200 hover:-translate-y-0.5 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-lg font-semibold leading-7 text-slate-950 dark:text-white">{attendance.subject}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Target: {minimumAttendance}% attendance
          </p>
        </div>
        <span
          className={`w-fit max-w-full shrink-0 rounded-full border px-3 py-1 text-sm font-semibold ${
            isAtRisk
              ? 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300'
              : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
          }`}
        >
          {formatPercentage(percentage)}
        </span>
      </div>

      <div
        aria-label={`${attendance.subject} attendance: ${formatPercentage(percentage)}`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={percentage}
        className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
        role="progressbar"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isAtRisk
              ? 'bg-gradient-to-r from-rose-500 via-red-500 to-orange-400'
              : 'bg-gradient-to-r from-emerald-500 via-lime-500 to-cyan-500'
          }`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-sm text-slate-500 dark:text-slate-400">Classes Attended</p>
          <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
            {attendance.attendedClasses} / {attendance.totalClasses}
          </p>
        </div>
        <div
          className={`rounded-2xl border p-4 ${
            isAtRisk
              ? 'border-rose-500/20 bg-rose-500/10'
              : 'border-emerald-500/20 bg-emerald-500/10'
          }`}
        >
          <p className={`text-sm ${isAtRisk ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300'}`}>
            Classes needed to reach {minimumAttendance}%
          </p>
          <p className={`mt-1 text-xl font-semibold ${isAtRisk ? 'text-rose-700 dark:text-rose-200' : 'text-emerald-700 dark:text-emerald-200'}`}>
            {classesNeeded === null ? 'Not reachable' : classesNeeded || 'Target met'}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200/70 pt-5 dark:border-slate-800">
        <button aria-label={`Edit attendance for ${attendance.subject}`} className="secondary-button px-4 py-2" onClick={() => onEdit(attendance)} type="button">
          Edit
        </button>
        <button
          className="secondary-button border-rose-500/20 px-4 py-2 text-rose-600 hover:border-rose-500/30 hover:bg-rose-500/10 dark:text-rose-300"
          aria-label={`Delete attendance for ${attendance.subject}`}
          onClick={() => onDelete(attendance)}
          type="button"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default AttendanceCard;
