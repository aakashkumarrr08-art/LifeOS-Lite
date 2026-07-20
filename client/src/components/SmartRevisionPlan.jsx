import { formatDuration } from '../utils/studySessionUtils.js';

const priorityClasses = {
  High: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300',
  Medium: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  Low: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
};

function SmartRevisionPlan({ revisionPlan }) {
  return (
    <article className="dashboard-panel">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Smart Revision Plan</p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Prioritize the right subjects</h3>
      <div className="mt-6 space-y-3">
        {revisionPlan.prioritySubjects.map((subject) => (
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60" key={subject.subject}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950 dark:text-white">{subject.subject}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{subject.reason}</p>
              </div>
              <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${priorityClasses[subject.priority] || priorityClasses.Medium}`}>
                {subject.priority}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-cyan-700 dark:text-cyan-300">Suggested revision: {formatDuration(subject.suggestedMinutes)}</p>
          </div>
        ))}
      </div>

      {revisionPlan.reminders.length > 0 ? (
        <div className="mt-6 border-t border-slate-200/70 pt-5 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Upcoming Revision Reminders</p>
          <div className="mt-3 space-y-2">
            {revisionPlan.reminders.map((reminder) => (
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300" key={`${reminder.subject}-${reminder.topic}-${reminder.time}`}>
                {reminder.message}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm leading-6 text-cyan-800 dark:text-cyan-200">
        {revisionPlan.recovery}
      </p>
    </article>
  );
}

export default SmartRevisionPlan;
