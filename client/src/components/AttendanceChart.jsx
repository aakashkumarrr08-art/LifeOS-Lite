import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';
import useTheme from '../hooks/useTheme.js';

function AttendanceChart({ data }) {
  const canvasRef = useRef(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (!canvasRef.current || !Array.isArray(data) || data.length === 0) {
      return undefined;
    }

    const chart = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: data.map((entry) => entry.subject),
        datasets: [
          {
            label: 'Attendance',
            data: data.map((entry) => entry.percentage),
            backgroundColor: data.map((entry) =>
              entry.percentage < 75 ? 'rgba(244, 63, 94, 0.72)' : 'rgba(16, 185, 129, 0.72)',
            ),
            borderColor: data.map((entry) => (entry.percentage < 75 ? '#f43f5e' : '#10b981')),
            borderRadius: 8,
            borderWidth: 1,
            maxBarThickness: 30,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
            bodyColor: isDarkMode ? '#cbd5e1' : '#334155',
            borderColor: isDarkMode ? '#1e293b' : '#cbd5e1',
            borderWidth: 1,
            callbacks: {
              label: (context) => `${context.raw}% attendance`,
            },
            titleColor: isDarkMode ? '#f8fafc' : '#0f172a',
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            grid: { color: isDarkMode ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.18)' },
            ticks: {
              callback: (value) => `${value}%`,
              color: isDarkMode ? '#94a3b8' : '#64748b',
            },
          },
          y: {
            grid: { display: false },
            ticks: { color: isDarkMode ? '#cbd5e1' : '#475569', font: { weight: '600' } },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [data, isDarkMode]);

  return (
    <article className="dashboard-panel">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Attendance Trend</p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Subject-wise attendance</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
        Subjects below 75% are highlighted in red so attendance risks remain visible.
      </p>
      {data.length > 0 ? (
        <div className="relative mx-auto mt-7 h-80 w-full min-w-0">
          <canvas aria-label="Subject-wise attendance chart" className="block h-full w-full" ref={canvasRef} role="img" />
        </div>
      ) : (
        <div className="mt-7 flex h-80 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm leading-6 text-slate-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400">
          Add attendance records to view your subject trend.
        </div>
      )}
    </article>
  );
}

export default AttendanceChart;
