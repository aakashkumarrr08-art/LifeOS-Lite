import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';
import useTheme from '../hooks/useTheme.js';

function TaskChart({ completedTasks, completionRate, pendingTasks, totalTasks }) {
  const canvasRef = useRef(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (!canvasRef.current || totalTasks === 0) {
      return undefined;
    }

    const chart = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Remaining'],
        datasets: [
          {
            data: [completedTasks, Math.max(totalTasks - completedTasks, 0)],
            backgroundColor: ['#10b981', '#e2e8f0'],
            borderColor: isDarkMode ? '#0f172a' : '#ffffff',
            borderWidth: 5,
            hoverOffset: 5,
          },
        ],
      },
      options: {
        cutout: '72%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              color: isDarkMode ? '#cbd5e1' : '#475569',
              font: { weight: '600' },
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
            bodyColor: isDarkMode ? '#cbd5e1' : '#334155',
            borderColor: isDarkMode ? '#1e293b' : '#cbd5e1',
            borderWidth: 1,
            titleColor: isDarkMode ? '#f8fafc' : '#0f172a',
          },
        },
      },
    });

    return () => chart.destroy();
  }, [completedTasks, isDarkMode, totalTasks]);

  return (
    <article className="dashboard-panel">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Task Completion Rate</p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{completionRate}% complete</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {completedTasks} finished and {pendingTasks} still in progress across your workspace.
      </p>
      {totalTasks > 0 ? (
        <div className="relative mt-5 h-64">
          <canvas className="h-full w-full" ref={canvasRef} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-8">
            <div className="text-center">
              <p className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{completionRate}%</p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">completion</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-7 flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm leading-6 text-slate-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400">
          Create tasks to start tracking completion.
        </div>
      )}
    </article>
  );
}

export default TaskChart;
