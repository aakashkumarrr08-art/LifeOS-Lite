import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';
import useTheme from '../hooks/useTheme.js';

function WeeklyStudyChart({ data }) {
  const canvasRef = useRef(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (!canvasRef.current || !Array.isArray(data) || data.length === 0) {
      return undefined;
    }

    const chart = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: data.map((entry) => entry.day),
        datasets: [
          {
            label: 'Study Hours',
            data: data.map((entry) => entry.hours),
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.16)',
            fill: true,
            tension: 0.38,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#0891b2',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
            titleColor: isDarkMode ? '#f8fafc' : '#0f172a',
            bodyColor: isDarkMode ? '#cbd5e1' : '#334155',
            borderColor: isDarkMode ? '#1e293b' : '#cbd5e1',
            borderWidth: 1,
            displayColors: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              font: {
                weight: '600',
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: isDarkMode ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.18)',
            },
            ticks: {
              color: isDarkMode ? '#94a3b8' : '#64748b',
              callback: (value) => `${value}h`,
            },
          },
        },
      },
    });

    return () => {
      chart.destroy();
    };
  }, [data, isDarkMode]);

  return <canvas className="h-full w-full" ref={canvasRef} />;
}

export default WeeklyStudyChart;

