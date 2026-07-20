import Attendance from '../models/Attendance.js';
import Task from '../models/Task.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  calculateAttendancePercentage,
  calculateClassesNeeded,
  formatAttendanceRecord,
} from '../utils/attendanceMetrics.js';

const startOfDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const isWithinRange = (value, start, end) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date >= start && date < end;
};

const buildWeeklyProgress = (tasks, now) => {
  const today = startOfDay(now);
  const firstDay = new Date(today);
  firstDay.setDate(firstDay.getDate() - 6);

  return Array.from({ length: 7 }, (_, index) => {
    const dayStart = new Date(firstDay);
    dayStart.setDate(firstDay.getDate() + index);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    return {
      date: dayStart.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(dayStart),
      createdTasks: tasks.filter((task) => isWithinRange(task.createdAt, dayStart, dayEnd)).length,
      completedTasks: tasks.filter(
        (task) =>
          task.status === 'Completed' &&
          isWithinRange(task.completedAt || task.updatedAt, dayStart, dayEnd),
      ).length,
      dueTasks: tasks.filter((task) => isWithinRange(task.dueDate, dayStart, dayEnd)).length,
    };
  });
};

const buildMonthlyProgress = (tasks, now) => {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthlyTasks = tasks.filter((task) => isWithinRange(task.dueDate, monthStart, monthEnd));
  const completedTasks = monthlyTasks.filter((task) => task.status === 'Completed').length;
  const pendingTasks = monthlyTasks.filter((task) => task.status !== 'Completed').length;
  const weeklyBreakdown = [];

  for (let weekStart = new Date(monthStart), weekNumber = 1; weekStart < monthEnd; weekNumber += 1) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const tasksForWeek = monthlyTasks.filter((task) => isWithinRange(task.dueDate, weekStart, weekEnd));
    weeklyBreakdown.push({
      label: `Week ${weekNumber}`,
      totalTasks: tasksForWeek.length,
      completedTasks: tasksForWeek.filter((task) => task.status === 'Completed').length,
    });

    weekStart.setDate(weekStart.getDate() + 7);
  }

  return {
    label: new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(monthStart),
    totalTasks: monthlyTasks.length,
    completedTasks,
    pendingTasks,
    completionRate:
      monthlyTasks.length > 0 ? Math.round((completedTasks / monthlyTasks.length) * 100) : 0,
    weeklyBreakdown,
  };
};

const getAnalytics = asyncHandler(async (req, res) => {
  const taskQuery = { userId: req.user._id };
  const [tasks, attendanceRecords] = await Promise.all([
    Task.find(taskQuery).sort({ createdAt: 1 }).lean(),
    Attendance.find(taskQuery).sort({ subject: 1 }).lean(),
  ]);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'Completed').length;
  const pendingTasks = tasks.filter((task) => task.status !== 'Completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const attendanceWithMetrics = attendanceRecords.map(formatAttendanceRecord);
  const totalClasses = attendanceWithMetrics.reduce((total, record) => total + record.totalClasses, 0);
  const attendedClasses = attendanceWithMetrics.reduce(
    (total, record) => total + record.attendedClasses,
    0,
  );
  const overallAttendance = calculateAttendancePercentage(attendedClasses, totalClasses);
  const subjectsBelow75 = attendanceWithMetrics.filter((record) => record.percentage < 75).length;
  const classesNeeded = attendanceWithMetrics.reduce(
    (total, record) =>
      total + (record.percentage < 75 ? calculateClassesNeeded(record.attendedClasses, record.totalClasses, 75) || 0 : 0),
    0,
  );
  const productivityScore = Math.round(completionRate * 0.5 + overallAttendance * 0.5);
  const now = new Date();

  res.status(200).json({
    success: true,
    message: 'Analytics data fetched successfully.',
    data: {
      productivityScore,
      completedTasks,
      pendingTasks,
      totalTasks,
      completionRate,
      overallAttendance,
      subjectsBelow75,
      classesNeeded,
      weeklyProgress: buildWeeklyProgress(tasks, now),
      monthlyProgress: buildMonthlyProgress(tasks, now),
      attendanceTrend: attendanceWithMetrics.map((record) => ({
        subject: record.subject,
        percentage: record.percentage,
        attendedClasses: record.attendedClasses,
        totalClasses: record.totalClasses,
        minimumAttendance: record.minimumAttendance,
      })),
    },
  });
});

export { getAnalytics };
