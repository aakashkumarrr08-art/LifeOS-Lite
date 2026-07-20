import { useCallback, useEffect, useState } from 'react';
import StudyFilter from '../components/StudyFilter.jsx';
import StudySessionCard from '../components/StudySessionCard.jsx';
import StudySessionModal from '../components/StudySessionModal.jsx';
import StudySubjectCard from '../components/StudySubjectCard.jsx';
import useRequestLifecycle from '../hooks/useRequestLifecycle.js';
import {
  createStudySession,
  deleteStudySession,
  getStudySessions,
  updateStudySession,
} from '../services/studySessionService.js';
import {
  formatDuration,
  formatStudyDate,
  getDateKey,
  getTodayDateKey,
  getWeekDates,
} from '../utils/studySessionUtils.js';
import { isRequestCanceled } from '../utils/apiError.js';

const DAILY_GOAL_MINUTES = 120;
const WEEKLY_GOAL_MINUTES = 720;

const defaultFilters = {
  query: '',
  subject: '',
  priority: '',
  status: '',
};

const getApiErrorMessage = (error) =>
  error.response?.data?.errors?.[0]?.message ||
  error.response?.data?.message ||
  'Unable to complete the study session action right now.';

const getProgressPercentage = (value, goal) => Math.min((value / goal) * 100, 100);

function StudyPlannerPage() {
  const [studySessions, setStudySessions] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedStudySession, setSelectedStudySession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [modalError, setModalError] = useState('');
  const { createRequestSignal, isMounted } = useRequestLifecycle();

  const loadStudySessions = useCallback(async () => {
    const signal = createRequestSignal();

    try {
      setErrorMessage('');
      setIsLoading(true);
      const response = await getStudySessions({ signal });

      if (isMounted()) {
        setStudySessions(response.studySessions);
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
      void loadStudySessions();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadStudySessions]);

  const openCreateModal = () => {
    setSelectedStudySession(null);
    setIsModalOpen(true);
    setActionMessage('');
    setModalError('');
  };

  const openEditModal = (studySession) => {
    setSelectedStudySession(studySession);
    setIsModalOpen(true);
    setActionMessage('');
    setModalError('');
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setSelectedStudySession(null);
      setModalError('');
    }
  };

  const handleStudySessionSubmit = async (payload) => {
    try {
      setModalError('');
      setIsSubmitting(true);

      if (selectedStudySession) {
        await updateStudySession(selectedStudySession.id, payload);
        setActionMessage('Study session updated successfully.');
      } else {
        await createStudySession(payload);
        setActionMessage('Study session added successfully.');
      }

      setIsModalOpen(false);
      setSelectedStudySession(null);
      await loadStudySessions();
    } catch (error) {
      setModalError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (studySession) => {
    try {
      setErrorMessage('');
      await updateStudySession(studySession.id, { status: 'Completed' });
      setActionMessage(`Marked "${studySession.topic}" as completed.`);
      await loadStudySessions();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const handleDelete = async (studySession) => {
    const shouldDelete = window.confirm(
      `Delete the study session "${studySession.topic}"? This action cannot be undone.`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setErrorMessage('');
      await deleteStudySession(studySession.id);
      setActionMessage(`Deleted "${studySession.topic}".`);
      await loadStudySessions();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const todayKey = getTodayDateKey();
  const currentTime = new Date().toTimeString().slice(0, 5);
  const weekDates = getWeekDates();
  const weekDateKeys = weekDates.map(getDateKey);
  const todaySessions = studySessions.filter((studySession) => getDateKey(studySession.date) === todayKey);
  const upcomingSessions = studySessions
    .filter((studySession) => {
      const sessionDateKey = getDateKey(studySession.date);
      return sessionDateKey > todayKey || (sessionDateKey === todayKey && studySession.startTime >= currentTime);
    })
    .slice(0, 4);
  const weeklySessions = studySessions.filter((studySession) => weekDateKeys.includes(getDateKey(studySession.date)));
  const dailyCompletedMinutes = todaySessions
    .filter((studySession) => studySession.status === 'Completed')
    .reduce((total, studySession) => total + studySession.duration, 0);
  const weeklyCompletedMinutes = weeklySessions
    .filter((studySession) => studySession.status === 'Completed')
    .reduce((total, studySession) => total + studySession.duration, 0);
  const completedSessions = studySessions.filter((studySession) => studySession.status === 'Completed').length;
  const subjects = Array.from(new Set(studySessions.map((studySession) => studySession.subject))).sort();
  const filteredStudySessions = studySessions.filter((studySession) => {
    const query = filters.query.trim().toLowerCase();
    const queryMatches =
      !query ||
      [studySession.subject, studySession.topic, studySession.notes]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    const subjectMatches = !filters.subject || studySession.subject === filters.subject;
    const priorityMatches = !filters.priority || studySession.priority === filters.priority;
    const statusMatches = !filters.status || studySession.status === filters.status;

    return queryMatches && subjectMatches && priorityMatches && statusMatches;
  });
  const subjectGroups = filteredStudySessions.reduce((groups, studySession) => {
    groups[studySession.subject] = groups[studySession.subject] || [];
    groups[studySession.subject].push(studySession);
    return groups;
  }, {});

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="dashboard-panel h-48 animate-pulse" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div className="dashboard-panel h-36 animate-pulse" key={index} />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="dashboard-panel h-80 animate-pulse" />
          <div className="dashboard-panel h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="page-hero">
        <div className="page-hero-content">
          <div className="max-w-2xl space-y-4">
            <span className="page-eyebrow">Study planner</span>
            <h2 className="page-title">Turn your study intentions into a schedule you can complete.</h2>
            <p className="page-description">
              Plan focused sessions by subject, keep your daily and weekly goals visible, and build a reliable revision rhythm.
            </p>
          </div>
          <button className="primary-button w-full border border-white/10 bg-white text-slate-950 hover:bg-slate-100 sm:w-auto dark:bg-white dark:text-slate-950" onClick={openCreateModal} type="button">
            Add Study Session
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="dashboard-panel">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today&apos;s Sessions</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">{todaySessions.length}</p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{formatStudyDate(new Date())}</p>
        </div>
        <div className="dashboard-panel">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed Sessions</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-300">{completedSessions}</p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Across all planned study blocks</p>
        </div>
        <div className="dashboard-panel">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Weekly Planned Time</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-cyan-700 dark:text-cyan-300">
            {formatDuration(weeklySessions.reduce((total, session) => total + session.duration, 0))}
          </p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Scheduled for this week</p>
        </div>
        <div className="dashboard-panel">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Upcoming Session</p>
          <p className="mt-4 break-words text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {upcomingSessions[0]?.topic || 'None planned'}
          </p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {upcomingSessions[0] ? `${formatStudyDate(upcomingSessions[0].date)} at ${upcomingSessions[0].startTime}` : 'Add a study block to get started'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="dashboard-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Daily Study Goal</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Build today&apos;s focus habit</h3>
            </div>
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
              {formatDuration(dailyCompletedMinutes)} / {formatDuration(DAILY_GOAL_MINUTES)}
            </span>
          </div>
          <div className="mt-7 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500" style={{ width: `${getProgressPercentage(dailyCompletedMinutes, DAILY_GOAL_MINUTES)}%` }} />
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Completed sessions count toward a two-hour daily focus goal.</p>
        </div>

        <div className="dashboard-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Weekly Study Goal</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Maintain a balanced revision rhythm</h3>
            </div>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              {formatDuration(weeklyCompletedMinutes)} / {formatDuration(WEEKLY_GOAL_MINUTES)}
            </span>
          </div>
          <div className="mt-7 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-lime-500 to-cyan-500" style={{ width: `${getProgressPercentage(weeklyCompletedMinutes, WEEKLY_GOAL_MINUTES)}%` }} />
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Complete twelve hours this week to reach your planned study target.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="dashboard-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Today&apos;s Schedule</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Your planned focus blocks</h3>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              {todaySessions.length} sessions
            </span>
          </div>
          <div className="mt-6 space-y-3">
            {todaySessions.length > 0 ? todaySessions.map((session) => (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60" key={session.id}>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950 dark:text-white">{session.topic}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{session.subject} · {session.startTime} - {session.endTime}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${session.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'}`}>
                  {session.status}
                </span>
              </div>
            )) : (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300">
                Nothing is scheduled for today. Add a focused study block to start your plan.
              </p>
            )}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Upcoming Study Sessions</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">What&apos;s next in your plan</h3>
            </div>
            <button className="secondary-button px-4 py-2" onClick={openCreateModal} type="button">Add Session</button>
          </div>
          <div className="mt-6 space-y-3">
            {upcomingSessions.length > 0 ? upcomingSessions.map((session) => (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60" key={session.id}>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950 dark:text-white">{session.topic}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatStudyDate(session.date)} · {session.startTime} · {session.subject}</p>
                </div>
                <span className="shrink-0 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                  {formatDuration(session.duration)}
                </span>
              </div>
            )) : (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300">
                Your next study block has not been planned yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <StudyFilter filters={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} subjects={subjects} />

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

      {Object.keys(subjectGroups).length > 0 ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Subject-wise Progress</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Study time across your subjects</h3>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(subjectGroups).map(([subject, sessions]) => (
              <StudySubjectCard key={subject} sessions={sessions} subject={subject} />
            ))}
          </div>
        </div>
      ) : null}

      {filteredStudySessions.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Study Sessions</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Your planned study blocks</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{filteredStudySessions.length} visible sessions</p>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {filteredStudySessions.map((studySession) => (
              <StudySessionCard
                key={studySession.id}
                onComplete={handleComplete}
                onDelete={handleDelete}
                onEdit={openEditModal}
                studySession={studySession}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="dashboard-panel mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-300">Study Planner</p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {studySessions.length === 0 ? 'Your study planner is ready for its first session.' : 'No study sessions match these filters.'}
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {studySessions.length === 0
              ? 'Plan a focused subject and topic to see daily, weekly, and subject-wise progress here.'
              : 'Reset or adjust the filters to view a different part of your study plan.'}
          </p>
          {studySessions.length === 0 ? (
            <button className="primary-button mt-7" onClick={openCreateModal} type="button">Add Your First Study Session</button>
          ) : null}
        </div>
      )}

      <div className="dashboard-panel">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Weekly Study Planner</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">A seven-day view of your study plan</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monday to Sunday</p>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
          {weekDates.map((date) => {
            const dateKey = getDateKey(date);
            const sessionsForDay = weeklySessions.filter((session) => getDateKey(session.date) === dateKey);
            const isToday = dateKey === todayKey;

            return (
              <div className={`min-h-40 rounded-2xl border p-4 ${isToday ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-slate-200/70 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60'}`} key={dateKey}>
                <p className={`text-sm font-semibold ${isToday ? 'text-cyan-700 dark:text-cyan-200' : 'text-slate-700 dark:text-slate-200'}`}>
                  {new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric' }).format(date)}
                </p>
                <div className="mt-4 space-y-2">
                  {sessionsForDay.length > 0 ? sessionsForDay.map((session) => (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-700 dark:bg-slate-900" key={session.id}>
                      <p className="font-semibold text-slate-950 dark:text-white">{session.startTime}</p>
                      <p className="mt-1 truncate text-slate-600 dark:text-slate-300">{session.topic}</p>
                    </div>
                  )) : <p className="text-xs leading-5 text-slate-400 dark:text-slate-500">Open study time</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <StudySessionModal
        errorMessage={modalError}
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleStudySessionSubmit}
        studySession={selectedStudySession}
      />
    </section>
  );
}

export default StudyPlannerPage;
