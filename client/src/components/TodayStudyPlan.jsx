import { formatDuration } from '../utils/studySessionUtils.js';

const priorityClasses = {
  High: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300',
  Medium: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  Low: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
};

function TodayStudyPlan({ studyPlan }) {
  return (
    <article className="dashboard-panel">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Today&apos;s Study Plan</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Focused actions for today</h3>
        <span className="w-fit rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
          {studyPlan.suggestedDuration.label}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {studyPlan.sessions.length > 0 ? studyPlan.sessions.map((session, index) => (
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60" key={`${session.subject}-${session.topic}-${index}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="break-words font-semibold text-slate-950 dark:text-white">{session.topic}</p>
                <p className="mt-1 text-sm text-cyan-700 dark:text-cyan-300">{session.subject}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {session.startTime ? `${session.startTime}${session.endTime ? ` - ${session.endTime}` : ''}` : formatDuration(session.durationMinutes)}
                </span>
                <span className={`rounded-full border px-3 py-1 ${priorityClasses[session.priority] || priorityClasses.Medium}`}>
                  {session.priority}
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{session.message}</p>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300">
            No study plan is needed right now. Use the next available block for active recall or a short revision session.
          </div>
        )}
      </div>

      {studyPlan.recoverySchedule ? (
        <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-800 dark:text-amber-200">
          {studyPlan.recoverySchedule.message}
        </div>
      ) : null}
    </article>
  );
}

export default TodayStudyPlan;
