import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';
import useTheme from '../hooks/useTheme.js';

function ProgressChart({ data, description, period, title }) {
  const canvasRef = useRef(null);
  const { isDarkMode } = useTheme();
  const isMonthly = period === 'monthly';

  useEffect(() => {
    if (!canvasRef.current || !Array.isArray(data) || data.length === 0) {
      return undefined;
    }

    const primaryKey = isMonthly ? 'totalTasks' : 'createdTasks';
    const primaryLabel = isMonthly ? 'Tasks Due' : 'Tasks Created';
    const chart = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: data.map((entry) => entry.label),
        datasets: [
          {
            label: primaryLabel,
            data: data.map((entry) => entry[primaryKey]),
            backgroundColor: 'rgba(6, 182, 212, 0.7)',
            borderColor: '#06b6d4',
            borderRadius: 8,
            borderWidth: 1,
            maxBarThickness: 34,
          },
          {
            label: 'Completed',
            data: data.map((entry) => entry.completedTasks),
            backgroundColor: 'rgba(16, 185, 129, 0.72)',
            borderColor: '#10b981',
            borderRadius: 8,
            borderWidth: 1,
            maxBarThickness: 34,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
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
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: isDarkMode ? '#94a3b8' : '#64748b', font: { weight: '600' } },
          },
          y: {
            beginAtZero: true,
            grid: { color: isDarkMode ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.18)' },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              precision: 0,
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [data, isDarkMode, isMonthly]);

  return (
    <article className="dashboard-panel">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">{period} progress</p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      {data.length > 0 ? (
        <div className="relative mx-auto mt-7 h-72 w-full min-w-0">
          <canvas aria-label={`${title} chart`} className="block h-full w-full" ref={canvasRef} role="img" />
        </div>
      ) : (
        <div className="mt-7 flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm leading-6 text-slate-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400">
          No task activity is available for this period yet.
        </div>
      )}
    </article>
  );
}

export default ProgressChart;
