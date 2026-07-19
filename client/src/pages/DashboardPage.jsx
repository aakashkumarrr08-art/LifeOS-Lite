import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import WeeklyStudyChart from '../components/WeeklyStudyChart.jsx';
import useAuth from '../hooks/useAuth.js';
import { getDashboardData } from '../services/dashboardService.js';

const accentClasses = {
  amber: 'from-amber-400/20 via-amber-300/10 to-transparent text-amber-600 dark:text-amber-300',
  cyan: 'from-cyan-400/20 via-cyan-300/10 to-transparent text-cyan-600 dark:text-cyan-300',
  emerald:
    'from-emerald-400/20 via-emerald-300/10 to-transparent text-emerald-600 dark:text-emerald-300',
  violet:
    'from-violet-400/20 via-violet-300/10 to-transparent text-violet-600 dark:text-violet-300',
};

const priorityClasses = {
  High: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300',
  Medium: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  Low: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
};

const getApiErrorMessage = (error) =>
  error.response?.data?.message || 'Unable to load dashboard data right now.';

function DashboardPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadDashboard = async () => {
    try {
      setErrorMessage('');
      setIsLoading(true);
      const response = await getDashboardData();
      setDashboardData(response.data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="dashboard-panel min-h-[200px] animate-pulse" />
        <div className="grid gap-6 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div className="dashboard-panel h-40 animate-pulse" key={index} />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="dashboard-panel h-[420px] animate-pulse" />
          <div className="space-y-6">
            <div className="dashboard-panel h-52 animate-pulse" />
            <div className="dashboard-panel h-52 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="dashboard-panel mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-500">Dashboard Error</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
          The dashboard could not be loaded.
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300">{errorMessage}</p>
        <button className="primary-button mt-8" onClick={loadDashboard} type="button">
          Retry Dashboard
        </button>
      </div>
    );
  }

  const { attendance, productivityScore, stats, studyProgress, todayTasks, upcomingExam, weeklyStudyHours } =
    dashboardData;
  const joinedOn = user?.createdAt
    ? new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
      }).format(new Date(user.createdAt))
    : 'Not available';
  const examDateLabel = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(upcomingExam.date));

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-8 text-white shadow-soft">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-5">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">
                Phase 3 Dashboard
              </span>
              <div className="space-y-4">
                <h2 className="text-4xl font-semibold tracking-tight">
                  A focused command center for student productivity.
                </h2>
                <p className="max-w-xl text-base leading-7 text-slate-200">
                  Track your study rhythm, attendance performance, and exam readiness with a single modern dashboard.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <button className="primary-button justify-center border border-white/10 bg-white text-slate-950 hover:bg-slate-100 dark:bg-white dark:text-slate-950" onClick={loadDashboard} type="button">
                Refresh Data
              </button>
              <Link
                className="secondary-button justify-center border-white/15 bg-white/10 text-white hover:bg-white/15"
                to="/profile"
              >
                Open Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                User Profile Card
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {user?.name}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{user?.email}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-lg font-semibold text-cyan-700 dark:text-cyan-300">
              {user?.name
                ?.split(' ')
                .map((namePart) => namePart[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Member Since</p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{joinedOn}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Streak</p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                {studyProgress.currentStreak} days
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            className="dashboard-panel relative overflow-hidden"
            key={stat.id}
          >
            <div
              className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-br ${accentClasses[stat.accent] || accentClasses.cyan}`}
            />
            <div className="relative">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {stat.value}
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{stat.change}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
        <div className="dashboard-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                Weekly Study Chart
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Study rhythm across the week
              </h3>
            </div>
            <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-700 dark:text-cyan-300">
              Goal: {studyProgress.weeklyGoalHours}h
            </div>
          </div>

          <div className="mt-8 h-[320px]">
            <WeeklyStudyChart data={weeklyStudyHours} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="dashboard-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              Study Progress Card
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {studyProgress.completedPercentage}% syllabus confidence
            </h3>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500"
                style={{ width: `${studyProgress.completedPercentage}%` }}
              />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Hours Done</p>
                <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                  {studyProgress.completedHours}h
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Goal</p>
                <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                  {studyProgress.weeklyGoalHours}h
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Focus Sessions</p>
                <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                  {studyProgress.focusSessions}
                </p>
              </div>
            </div>
          </div>

          <div className="dashboard-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              Productivity Score
            </p>
            <div className="mt-6 flex items-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-[10px] border-cyan-500/20 bg-cyan-500/10 text-3xl font-semibold text-cyan-700 dark:text-cyan-300">
                {productivityScore.score}
              </div>
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  {productivityScore.label}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {productivityScore.insight}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.9fr]">
        <div className="dashboard-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                Today&apos;s Tasks Card
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Priority task queue
              </h3>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
              {todayTasks.length} tasks
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {todayTasks.map((task) => (
              <div
                className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70"
                key={task.id}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-950 dark:text-white">{task.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                        {task.time}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                        {task.category}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      priorityClasses[task.priority] || priorityClasses.Medium
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="dashboard-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              Attendance Card
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {attendance.percentage}% semester attendance
            </h3>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-lime-500 to-cyan-500"
                style={{ width: `${attendance.percentage}%` }}
              />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Attended</p>
                <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                  {attendance.attendedClasses}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                  {attendance.totalClasses}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                  {attendance.status}
                </p>
              </div>
            </div>
          </div>

          <div className="dashboard-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              Upcoming Exam Countdown Card
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {upcomingExam.title}
            </h3>
            <div className="mt-6 flex items-end gap-4">
              <p className="text-5xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {upcomingExam.daysRemaining}
              </p>
              <p className="pb-2 text-sm font-medium uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-300">
                Days Left
              </p>
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>Date: {examDateLabel}</p>
              <p>Course: {upcomingExam.courseCode}</p>
              <p>Venue: {upcomingExam.venue}</p>
              <p>Syllabus Coverage: {upcomingExam.syllabusCoverage}%</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="dashboard-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              Quick Actions Card
            </p>
            <div className="mt-6 space-y-3">
              <button className="primary-button w-full justify-center" onClick={loadDashboard} type="button">
                Refresh Dashboard
              </button>
              <Link className="secondary-button w-full justify-center" to="/profile">
                Open Profile
              </Link>
              <button className="secondary-button w-full justify-center" onClick={handleLogout} type="button">
                Logout
              </button>
            </div>
          </div>

          <div className="dashboard-panel">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              Today&apos;s Focus
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Keep momentum through evening revision.
            </h3>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              You have already completed more than half of today&apos;s plan. Finishing the assignment submission and flashcard review will keep your score in the strong range.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;

