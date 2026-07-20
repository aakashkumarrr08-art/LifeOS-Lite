import { config } from '../config/env.js';
import Attendance from '../models/Attendance.js';
import StudySession from '../models/StudySession.js';
import Task from '../models/Task.js';
import { buildAcademicContext, buildAiDashboardSummary } from '../services/aiService.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  calculateAttendancePercentage,
  formatAttendanceRecord,
} from '../utils/attendanceMetrics.js';
import { getProductivityLevel, isWithinRange, startOfDay } from '../utils/aiUtils.js';

const DEFAULT_WEEKLY_STUDY_GOAL_HOURS = 10;

const getWeekBounds = (date) => {
  const start = startOfDay(date);
  const dayOfWeek = start.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  start.setDate(start.getDate() - daysSinceMonday);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return { end, start };
};

const getStudyStreak = (studySessions, now) => {
  const completedDateKeys = new Set(
    studySessions
      .filter((session) => session.status === 'Completed')
      .map((session) => startOfDay(session.date).getTime()),
  );
  const cursor = startOfDay(now);

  if (!completedDateKeys.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;

  while (completedDateKeys.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const getWeeklyStudyHours = (studySessions, startOfWeek) =>
  Array.from({ length: 7 }, (_, index) => {
    const dayStart = new Date(startOfWeek);
    dayStart.setDate(dayStart.getDate() + index);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const minutes = studySessions
      .filter(
        (session) =>
          session.status === 'Completed' && isWithinRange(session.date, dayStart, dayEnd),
      )
      .reduce((total, session) => total + session.duration, 0);

    return {
      day: new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(dayStart),
      hours: Number((minutes / 60).toFixed(1)),
    };
  });

const getUpcomingExam = (now) => {
  const examDate = new Date(config.upcomingExam.date);

  if (!config.upcomingExam.date || Number.isNaN(examDate.getTime()) || examDate <= now) {
    return {
      configured: false,
      message: 'No upcoming exam is configured yet.',
    };
  }

  return {
    configured: true,
    courseCode: config.upcomingExam.courseCode || 'Course code not set',
    date: examDate.toISOString(),
    daysRemaining: Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    title: config.upcomingExam.title || 'Upcoming Semester Exam',
    venue: config.upcomingExam.venue || 'Venue to be announced',
  };
};

const getProductivityInsight = (score) => {
  const level = getProductivityLevel(score);

  if (level === 'Excellent') {
    return 'Excellent consistency. Maintain your current task and attendance rhythm.';
  }

  if (level === 'Good') {
    return 'You have steady momentum. Complete a few focused tasks to move higher.';
  }

  if (level === 'Average') {
    return 'Prioritize unfinished tasks and protect attendance with smaller focus blocks.';
  }

  return 'Start with one small task and the next scheduled class to rebuild momentum.';
};

const getDashboardData = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = startOfDay(now);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const upcomingDeadlineLimit = new Date(startOfToday);
  upcomingDeadlineLimit.setDate(upcomingDeadlineLimit.getDate() + 7);
  const { start: startOfWeek, end: endOfWeek } = getWeekBounds(now);
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const query = { userId: req.user._id };

  const [tasks, attendanceRecords, studySessions] = await Promise.all([
    Task.find(query).sort({ dueDate: 1, createdAt: -1 }).lean(),
    Attendance.find(query).sort({ subject: 1, createdAt: -1 }).lean(),
    StudySession.find(query).sort({ date: 1, startTime: 1 }).lean(),
  ]);
  const academicContext = buildAcademicContext({ attendanceRecords, now, studySessions, tasks });
  const aiInsights = buildAiDashboardSummary(academicContext);
  const attendanceWithMetrics = attendanceRecords.map(formatAttendanceRecord);
  const totalAttendanceClasses = attendanceWithMetrics.reduce(
    (total, record) => total + record.totalClasses,
    0,
  );
  const totalAttendedClasses = attendanceWithMetrics.reduce(
    (total, record) => total + record.attendedClasses,
    0,
  );
  const attendancePercentage = calculateAttendancePercentage(totalAttendedClasses, totalAttendanceClasses);
  const atRiskRecords = attendanceWithMetrics.filter((record) => record.isBelowMinimum);
  const belowSeventyFiveRecords = attendanceWithMetrics.filter((record) => record.percentage < 75);
  const classesNeeded = atRiskRecords.reduce(
    (total, record) => total + (record.classesNeeded || 0),
    0,
  );
  const upcomingStudySession = studySessions.find((session) => {
    if (session.status === 'Completed') {
      return false;
    }

    const sessionDate = new Date(session.date);
    return (
      sessionDate > startOfToday ||
      (isWithinRange(sessionDate, startOfToday, endOfToday) && session.startTime >= currentTime)
    );
  });
  const weeklyCompletedSessions = studySessions.filter(
    (session) =>
      session.status === 'Completed' && isWithinRange(session.date, startOfWeek, endOfWeek),
  );
  const weeklyCompletedMinutes = weeklyCompletedSessions.reduce(
    (total, session) => total + session.duration,
    0,
  );
  const weeklyStudyHours = Number((weeklyCompletedMinutes / 60).toFixed(1));
  const weeklyGoalPercentage = Math.min(
    Math.round((weeklyStudyHours / DEFAULT_WEEKLY_STUDY_GOAL_HOURS) * 100),
    100,
  );
  const upcomingDeadlines = tasks.filter(
    (task) =>
      task.status !== 'Completed' &&
      isWithinRange(task.dueDate, startOfToday, upcomingDeadlineLimit),
  ).length;

  res.status(200).json({
    success: true,
    message: 'Dashboard data fetched successfully.',
    data: {
      student: {
        name: req.user.name,
        email: req.user.email,
        joinedAt: req.user.createdAt,
      },
      stats: [
        {
          id: 'totalTasks',
          label: 'Total Tasks',
          value: academicContext.analytics.totalTasks,
          change: `${academicContext.analytics.completionRate}% completion rate`,
          accent: 'cyan',
        },
        {
          id: 'completedTasks',
          label: 'Completed Tasks',
          value: academicContext.analytics.completedTasks,
          change: 'Finished across all subjects',
          accent: 'emerald',
        },
        {
          id: 'pendingTasks',
          label: 'Open Tasks',
          value: academicContext.analytics.pendingTasks,
          change: 'Pending or in progress',
          accent: 'amber',
        },
        {
          id: 'upcomingDeadlines',
          label: 'Upcoming Deadlines',
          value: upcomingDeadlines,
          change: 'Due within the next 7 days',
          accent: 'violet',
        },
      ],
      todayTasks: academicContext.tasks.today.slice(0, 4).map((task) => ({
        id: task._id.toString(),
        title: task.title,
        subject: task.subject,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
      })),
      studyProgress: {
        completedPercentage: weeklyGoalPercentage,
        weeklyGoalHours: DEFAULT_WEEKLY_STUDY_GOAL_HOURS,
        completedHours: weeklyStudyHours,
        focusSessions: weeklyCompletedSessions.length,
        currentStreak: getStudyStreak(studySessions, now),
      },
      studyPlanner: {
        todaySessions: studySessions
          .filter((session) => isWithinRange(session.date, startOfToday, endOfToday))
          .slice(0, 4)
          .map((session) => ({
            id: session._id.toString(),
            subject: session.subject,
            topic: session.topic,
            startTime: session.startTime,
            endTime: session.endTime,
            duration: session.duration,
            priority: session.priority,
            status: session.status,
          })),
        upcomingSession: upcomingStudySession
          ? {
              id: upcomingStudySession._id.toString(),
              subject: upcomingStudySession.subject,
              topic: upcomingStudySession.topic,
              date: upcomingStudySession.date,
              startTime: upcomingStudySession.startTime,
              duration: upcomingStudySession.duration,
              priority: upcomingStudySession.priority,
            }
          : null,
        weeklyHours: weeklyStudyHours,
        completedSessions: studySessions.filter((session) => session.status === 'Completed').length,
      },
      aiInsights,
      attendance: {
        hasRecords: attendanceWithMetrics.length > 0,
        percentage: attendancePercentage,
        attendedClasses: totalAttendedClasses,
        totalClasses: totalAttendanceClasses,
        missedClasses: totalAttendanceClasses - totalAttendedClasses,
        subjectCount: attendanceWithMetrics.length,
        atRiskSubjects: atRiskRecords.length,
        belowSeventyFiveSubjects: belowSeventyFiveRecords.length,
        classesNeeded,
        status:
          attendanceWithMetrics.length === 0
            ? 'No Records'
            : attendancePercentage >= 75
              ? 'Safe Zone'
              : 'Needs Attention',
      },
      upcomingExam: getUpcomingExam(now),
      productivityScore: {
        score: academicContext.analytics.productivityScore,
        label: getProductivityLevel(academicContext.analytics.productivityScore),
        insight: getProductivityInsight(academicContext.analytics.productivityScore),
      },
      weeklyStudyHours: getWeeklyStudyHours(studySessions, startOfWeek),
    },
  });
});

export { getDashboardData };
