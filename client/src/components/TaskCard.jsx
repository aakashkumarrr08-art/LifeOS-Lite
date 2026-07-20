const priorityClasses = {
  High: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300',
  Medium: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  Low: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
};

const statusClasses = {
  Pending: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  'In Progress': 'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  Completed: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
};

function TaskCard({ task, onComplete, onDelete, onEdit }) {
  const dueDate = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(task.dueDate));
  const isCompleted = task.status === 'Completed';

  return (
    <article className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-white p-4 shadow-soft transition duration-200 hover:-translate-y-0.5 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-lg font-semibold leading-7 text-slate-950 dark:text-white">{task.title}</p>
          {task.description ? (
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{task.description}</p>
          ) : null}
        </div>
        <span
          className={`w-fit max-w-full shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
            statusClasses[task.status] || statusClasses.Pending
          }`}
        >
          {task.status}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium">
        <span className="max-w-full break-words rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
          {task.subject}
        </span>
        <span
          className={`rounded-full border px-3 py-1 ${
            priorityClasses[task.priority] || priorityClasses.Medium
          }`}
        >
          {task.priority} Priority
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
          Due {dueDate}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200/70 pt-5 dark:border-slate-800">
        {!isCompleted ? (
          <button aria-label={`Mark ${task.title} as completed`} className="primary-button px-4 py-2" onClick={() => onComplete(task)} type="button">
            Mark Complete
          </button>
        ) : (
          <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
            Completed
          </span>
        )}
        <button aria-label={`Edit ${task.title}`} className="secondary-button px-4 py-2" onClick={() => onEdit(task)} type="button">
          Edit
        </button>
        <button
          className="secondary-button border-rose-500/20 px-4 py-2 text-rose-600 hover:border-rose-500/30 hover:bg-rose-500/10 dark:text-rose-300"
          aria-label={`Delete ${task.title}`}
          onClick={() => onDelete(task)}
          type="button"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
