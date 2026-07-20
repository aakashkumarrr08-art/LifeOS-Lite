import { useCallback, useEffect, useState } from 'react';
import TaskCard from '../components/TaskCard.jsx';
import TaskFilter from '../components/TaskFilter.jsx';
import TaskModal from '../components/TaskModal.jsx';
import useRequestLifecycle from '../hooks/useRequestLifecycle.js';
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from '../services/taskService.js';
import { isRequestCanceled } from '../utils/apiError.js';

const defaultFilters = {
  status: '',
  priority: '',
  subject: '',
};

const getApiErrorMessage = (error) =>
  error.response?.data?.errors?.[0]?.message ||
  error.response?.data?.message ||
  'Unable to complete the task action right now.';

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [modalError, setModalError] = useState('');
  const { createRequestSignal, isMounted } = useRequestLifecycle();

  const loadTasks = useCallback(async () => {
    const signal = createRequestSignal();

    try {
      setErrorMessage('');
      setIsLoading(true);
      const response = await getTasks({ signal });

      if (isMounted()) {
        setTasks(response.tasks);
      }
    } catch (error) {
      if (isMounted() && !isRequestCanceled(error)) {
        setErrorMessage(getApiErrorMessage(error));
      }
    } finally {
      if (isMounted()) {
        setIsLoading(false);
      }
    }
  }, [createRequestSignal, isMounted]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadTasks();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadTasks]);

  const openCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
    setActionMessage('');
    setModalError('');
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
    setActionMessage('');
    setModalError('');
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setSelectedTask(null);
      setModalError('');
    }
  };

  const handleTaskSubmit = async (payload) => {
    try {
      setModalError('');
      setIsSubmitting(true);
      if (selectedTask) {
        await updateTask(selectedTask.id, payload);
        setActionMessage('Task updated successfully.');
      } else {
        await createTask(payload);
        setActionMessage('Task created successfully.');
      }
      closeModal();
      await loadTasks();
    } catch (error) {
      setModalError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (task) => {
    try {
      setErrorMessage('');
      await updateTask(task.id, { status: 'Completed' });
      setActionMessage(`Marked "${task.title}" as completed.`);
      await loadTasks();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const handleDelete = async (task) => {
    const shouldDelete = window.confirm(`Delete "${task.title}"? This action cannot be undone.`);

    if (!shouldDelete) {
      return;
    }

    try {
      setErrorMessage('');
      await deleteTask(task.id);
      setActionMessage(`Deleted "${task.title}".`);
      await loadTasks();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const completedCount = tasks.filter((task) => task.status === 'Completed').length;
  const pendingCount = tasks.filter((task) => task.status === 'Pending').length;
  const today = new Date();
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  const deadlineLimit = new Date(startOfToday);
  deadlineLimit.setDate(deadlineLimit.getDate() + 7);
  const upcomingCount = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    return task.status !== 'Completed' && dueDate >= startOfToday && dueDate <= deadlineLimit;
  }).length;
  const subjects = Array.from(new Set(tasks.map((task) => task.subject))).sort();
  const filteredTasks = tasks.filter((task) => {
    const statusMatches = !filters.status || task.status === filters.status;
    const priorityMatches = !filters.priority || task.priority === filters.priority;
    const subjectMatches = !filters.subject || task.subject === filters.subject;
    return statusMatches && priorityMatches && subjectMatches;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="dashboard-panel h-44 animate-pulse" />
        <div className="dashboard-panel h-28 animate-pulse" />
        <div className="grid gap-5 xl:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <div className="dashboard-panel h-64 animate-pulse" key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-8 text-white shadow-soft">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
              Phase 4 Task Manager
            </span>
            <h2 className="text-4xl font-semibold tracking-tight">Plan your work with clear priorities and deadlines.</h2>
            <p className="text-base leading-7 text-slate-200">
              Create, update, complete, and filter personal study tasks. Every task is stored securely in MongoDB and belongs only to your account.
            </p>
          </div>
          <button className="primary-button justify-center border border-white/10 bg-white text-slate-950 hover:bg-slate-100 dark:bg-white dark:text-slate-950" onClick={openCreateModal} type="button">
            Create Task
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="dashboard-panel">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Tasks</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">{tasks.length}</p>
        </div>
        <div className="dashboard-panel">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-300">{completedCount}</p>
        </div>
        <div className="dashboard-panel">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-amber-600 dark:text-amber-300">{pendingCount}</p>
        </div>
        <div className="dashboard-panel">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Upcoming Deadlines</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-violet-600 dark:text-violet-300">{upcomingCount}</p>
        </div>
      </div>

      <TaskFilter filters={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} subjects={subjects} />

      {actionMessage ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-medium text-emerald-700 dark:text-emerald-300">
          {actionMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm font-medium text-rose-700 dark:text-rose-300">
          {errorMessage}
        </div>
      ) : null}

      {filteredTasks.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onEdit={openEditModal}
              task={task}
            />
          ))}
        </div>
      ) : (
        <div className="dashboard-panel mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-300">Task Workspace</p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {tasks.length === 0 ? 'Your task list is ready for its first item.' : 'No tasks match these filters.'}
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {tasks.length === 0
              ? 'Create a task to see your real workload reflected in the dashboard.'
              : 'Reset or adjust the filters to view another group of tasks.'}
          </p>
          {tasks.length === 0 ? (
            <button className="primary-button mt-7" onClick={openCreateModal} type="button">
              Create Your First Task
            </button>
          ) : null}
        </div>
      )}

      <TaskModal
        errorMessage={modalError}
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleTaskSubmit}
        task={selectedTask}
      />
    </section>
  );
}

export default TaskPage;
