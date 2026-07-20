import Attendance from '../models/Attendance.js';
import StudySession from '../models/StudySession.js';
import Task from '../models/Task.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  calculateAttendancePercentage,
  formatAttendanceRecord,
} from '../utils/attendanceMetrics.js';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const UPCOMING_EXAM_DATE = new Date('2026-08-18T09:00:00.000Z');

const getDashboardData = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const upcomingDeadlineLimit = new Date(startOfToday);
  upcomingDeadlineLimit.setDate(upcomingDeadlineLimit.getDate() + 7);
  const daysRemaining = Math.max(
    Math.ceil((UPCOMING_EXAM_DATE.getTime() - now.getTime()) / MS_PER_DAY),
    0,
  );
  const taskQuery = { userId: req.user._id };
  const startOfWeek = new Date(startOfToday);
  const dayOfWeek = startOfWeek.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [
    totalTasks,
    completedTasks,
    pendingTasks,
    upcomingDeadlines,
    todayTasks,
    attendanceRecords,
    todayStudySessions,
    upcomingStudySessions,
    weeklyStudySessions,
    completedStudySessions,
  ] = await Promise.all([
    Task.countDocuments(taskQuery),
    Task.countDocuments({ ...taskQuery, status: 'Completed' }),
    Task.countDocuments({ ...taskQuery, status: 'Pending' }),
    Task.countDocuments({
      ...taskQuery,
      status: { $ne: 'Completed' },
      dueDate: { $gte: startOfToday, $lte: upcomingDeadlineLimit },
    }),
    Task.find({
      ...taskQuery,
      dueDate: { $gte: startOfToday, $lt: endOfToday },
    })
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(4),
    Attendance.find(taskQuery).sort({ subject: 1, createdAt: -1 }),
    StudySession.find({ ...taskQuery, date: { $gte: startOfToday, $lt: endOfToday } })
      .sort({ startTime: 1 })
      .limit(4),
    StudySession.find({ ...taskQuery, date: { $gte: startOfToday } })
      .sort({ date: 1, startTime: 1 })
      .limit(10),
    StudySession.find({ ...taskQuery, date: { $gte: startOfWeek, $lt: endOfWeek } }),
    StudySession.countDocuments({ ...taskQuery, status: 'Completed' }),
  ]);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
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
  const upcomingStudySession = upcomingStudySessions.find((session) => {
    const sessionDate = new Date(session.date);
    return sessionDate > startOfToday || session.startTime >= currentTime;
  });
  const weeklyStudyHours = Number(
    (
      weeklyStudySessions
        .filter((session) => session.status === 'Completed')
        .reduce((total, session) => total + session.duration, 0) / 60
    ).toFixed(1),
  );

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
          value: totalTasks,
          change: `${completionRate}% completion rate`,
          accent: 'cyan',
        },
        {
          id: 'completedTasks',
          label: 'Completed Tasks',
          value: completedTasks,
          change: 'Finished across all subjects',
          accent: 'emerald',
        },
        {
          id: 'pendingTasks',
          label: 'Pending Tasks',
          value: pendingTasks,
          change: 'Ready for your next focus block',
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
      todayTasks: todayTasks.map((task) => ({
        id: task.id,
        title: task.title,
        subject: task.subject,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
      })),
      studyProgress: {
        completedPercentage: 72,
        weeklyGoalHours: 24,
        completedHours: 17.5,
        focusSessions: 9,
        currentStreak: 6,
      },
      studyPlanner: {
        todaySessions: todayStudySessions.map((session) => ({
          id: session.id,
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
              id: upcomingStudySession.id,
              subject: upcomingStudySession.subject,
              topic: upcomingStudySession.topic,
              date: upcomingStudySession.date,
              startTime: upcomingStudySession.startTime,
              duration: upcomingStudySession.duration,
              priority: upcomingStudySession.priority,
            }
          : null,
        weeklyHours: weeklyStudyHours,
        completedSessions: completedStudySessions,
      },
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
      upcomingExam: {
        title: 'Database Systems Semester Exam',
        courseCode: 'CS-402',
        date: UPCOMING_EXAM_DATE.toISOString(),
        venue: 'Block B, Room 204',
        daysRemaining,
        syllabusCoverage: 74,
      },
      productivityScore: {
        score: 86,
        label: 'Strong Momentum',
        insight: 'You are ahead on attendance and revision. Finish two more focus sessions to cross 90.',
      },
      weeklyStudyHours: [
        { day: 'Mon', hours: 2.5 },
        { day: 'Tue', hours: 3.5 },
        { day: 'Wed', hours: 2.75 },
        { day: 'Thu', hours: 4.25 },
        { day: 'Fri', hours: 3.8 },
        { day: 'Sat', hours: 5.2 },
        { day: 'Sun', hours: 4.1 },
      ],
    },
  });
});

export { getDashboardData };
