import { formatDuration, formatStudyDate } from '../utils/studySessionUtils.js';

const priorityClasses = {
  High: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300',
  Medium: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  Low: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
};

function StudySessionCard({ onComplete, onDelete, onEdit, studySession }) {
  const isCompleted = studySession.status === 'Completed';

  return (
    <article className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-white p-4 shadow-soft transition duration-200 hover:-translate-y-0.5 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-lg font-semibold leading-7 text-slate-950 dark:text-white">{studySession.topic}</p>
          <p className="mt-2 text-sm font-medium text-cyan-700 dark:text-cyan-300">{studySession.subject}</p>
        </div>
        <span
          className={`w-fit max-w-full shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
            isCompleted
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
              : 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          {studySession.status}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium">
        <span className="max-w-full break-words rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
          {formatStudyDate(studySession.date)}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
          {studySession.startTime} - {studySession.endTime}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
          {formatDuration(studySession.duration)}
        </span>
        <span
          className={`rounded-full border px-3 py-1 ${
            priorityClasses[studySession.priority] || priorityClasses.Medium
          }`}
        >
          {studySession.priority} Priority
        </span>
      </div>

      {studySession.notes ? (
        <p className="mt-5 border-l-2 border-cyan-500/40 pl-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {studySession.notes}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200/70 pt-5 dark:border-slate-800">
        {!isCompleted ? (
          <button aria-label={`Mark ${studySession.topic} as completed`} className="primary-button px-4 py-2" onClick={() => onComplete(studySession)} type="button">
            Mark Completed
          </button>
        ) : (
          <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
            Completed
          </span>
        )}
        <button aria-label={`Edit ${studySession.topic}`} className="secondary-button px-4 py-2" onClick={() => onEdit(studySession)} type="button">
          Edit
        </button>
        <button
          className="secondary-button border-rose-500/20 px-4 py-2 text-rose-600 hover:border-rose-500/30 hover:bg-rose-500/10 dark:text-rose-300"
          aria-label={`Delete ${studySession.topic}`}
          onClick={() => onDelete(studySession)}
          type="button"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default StudySessionCard;
