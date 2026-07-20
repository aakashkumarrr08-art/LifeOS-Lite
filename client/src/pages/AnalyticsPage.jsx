import { useCallback, useEffect, useState } from 'react';
import AnalyticsCard from '../components/AnalyticsCard.jsx';
import AttendanceChart from '../components/AttendanceChart.jsx';
import ProgressChart from '../components/ProgressChart.jsx';
import StatisticsCard from '../components/StatisticsCard.jsx';
import TaskChart from '../components/TaskChart.jsx';
import useRequestLifecycle from '../hooks/useRequestLifecycle.js';
import { getAnalyticsData } from '../services/analyticsService.js';
import { isRequestCanceled } from '../utils/apiError.js';

const getApiErrorMessage = (error) =>
  error.response?.data?.message || 'Unable to load analytics right now.';

const getProductivitySummary = (score) => {
  if (score >= 85) {
    return {
      label: 'Excellent',
      description: 'Your task completion and attendance are working together at a strong pace.',
    };
  }

  if (score >= 70) {
    return {
      label: 'Good',
      description: 'You have steady momentum. A few focused task completions can move you higher.',
    };
  }

  if (score >= 50) {
    return {
      label: 'Average',
      description: 'Your foundation is in place. Prioritize unfinished work and keep attendance above 75%.',
    };
  }

  return {
    label: 'Needs Improvement',
    description: 'Focus on completing planned tasks and attending upcoming classes to rebuild momentum.',
  };
};

const productivityLevels = [
  { label: 'Excellent', range: '85-100' },
  { label: 'Good', range: '70-84' },
  { label: 'Average', range: '50-69' },
  { label: 'Needs Improvement', range: '0-49' },
];

function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { createRequestSignal, isMounted } = useRequestLifecycle();

  const loadAnalytics = useCallback(async () => {
    const signal = createRequestSignal();

    try {
      setErrorMessage('');
      setIsLoading(true);
      const response = await getAnalyticsData({ signal });

      if (isMounted()) {
        setAnalyticsData(response.data);
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
      void loadAnalytics();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadAnalytics]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="dashboard-panel h-48 animate-pulse" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div className="dashboard-panel h-40 animate-pulse" key={index} />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="dashboard-panel h-96 animate-pulse" />
          <div className="dashboard-panel h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="dashboard-panel mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-500">Analytics Error</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Analytics could not be loaded.
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300">{errorMessage}</p>
        <button className="primary-button mt-8" onClick={loadAnalytics} type="button">
          Retry Analytics
        </button>
      </div>
    );
  }

  const summary = getProductivitySummary(analyticsData.productivityScore);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-8 text-white shadow-soft">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
              Phase 6 Analytics
            </span>
            <h2 className="text-4xl font-semibold tracking-tight">Turn your task and attendance data into clear next steps.</h2>
            <p className="text-base leading-7 text-slate-200">
              Your productivity score weighs task completion and overall attendance equally, so every metric has a practical meaning.
            </p>
          </div>
          <button className="primary-button justify-center border border-white/10 bg-white text-slate-950 hover:bg-slate-100 dark:bg-white dark:text-slate-950" onClick={loadAnalytics} type="button">
            Refresh Analytics
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        <AnalyticsCard description={summary.description} score={analyticsData.productivityScore} summary={summary.label} />
        <StatisticsCard accent="cyan" detail={`${analyticsData.pendingTasks} still to complete`} label="Total Tasks" value={analyticsData.totalTasks} />
        <StatisticsCard accent="emerald" detail={`${analyticsData.completionRate}% overall completion`} label="Completed Tasks" value={analyticsData.completedTasks} />
        <StatisticsCard
          accent={analyticsData.overallAttendance < 75 ? 'rose' : 'emerald'}
          detail={`${analyticsData.subjectsBelow75} subjects below 75%`}
          label="Overall Attendance"
          value={`${analyticsData.overallAttendance}%`}
        />
      </div>

      <div className="grid gap-6 2xl:grid-cols-2">
        <ProgressChart
          data={analyticsData.weeklyProgress}
          description="Created and completed task activity across the last seven days."
          period="weekly"
          title="Weekly task progress"
        />
        <ProgressChart
          data={analyticsData.monthlyProgress.weeklyBreakdown}
          description={`${analyticsData.monthlyProgress.label} workload, grouped by due-week.`}
          period="monthly"
          title="Monthly progress"
        />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
        <AttendanceChart data={analyticsData.attendanceTrend} />
        <TaskChart
          completedTasks={analyticsData.completedTasks}
          completionRate={analyticsData.completionRate}
          pendingTasks={analyticsData.pendingTasks}
          totalTasks={analyticsData.totalTasks}
        />
      </div>

      <div className="dashboard-panel">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Performance Summary</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Current level: {summary.label}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{summary.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
            {productivityLevels.map((level) => (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm transition ${
                  level.label === summary.label
                    ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200'
                    : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400'
                }`}
                key={level.label}
              >
                <p className="font-semibold">{level.label}</p>
                <p className="mt-1 text-xs">{level.range} score</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-slate-200/70 pt-6 sm:grid-cols-3 dark:border-slate-800">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Subjects Below 75%</p>
            <p className={`mt-1 text-2xl font-semibold ${analyticsData.subjectsBelow75 > 0 ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300'}`}>
              {analyticsData.subjectsBelow75}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Classes Needed to Reach 75%</p>
            <p className="mt-1 text-2xl font-semibold text-cyan-700 dark:text-cyan-300">{analyticsData.classesNeeded}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">This Month&apos;s Completion</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">
              {analyticsData.monthlyProgress.completionRate}%
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AnalyticsPage;
