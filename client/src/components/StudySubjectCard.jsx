import { formatDuration } from '../utils/studySessionUtils.js';

function StudySubjectCard({ sessions, subject }) {
  const completedSessions = sessions.filter((session) => session.status === 'Completed');
  const plannedMinutes = sessions.reduce((total, session) => total + session.duration, 0);
  const completedMinutes = completedSessions.reduce((total, session) => total + session.duration, 0);

  return (
    <article className="rounded-[1.5rem] border border-slate-200/70 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-950 dark:text-white">{subject}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{sessions.length} planned sessions</p>
        </div>
        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
          {formatDuration(plannedMinutes)}
        </span>
      </div>

      <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500"
          style={{ width: `${plannedMinutes > 0 ? (completedMinutes / plannedMinutes) * 100 : 0}%` }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400">Completed</span>
        <span className="font-semibold text-slate-950 dark:text-white">
          {completedSessions.length}/{sessions.length} sessions
        </span>
      </div>
    </article>
  );
}

export default StudySubjectCard;
