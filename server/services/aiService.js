import Attendance from '../models/Attendance.js';
import StudySession from '../models/StudySession.js';
import Task from '../models/Task.js';
import {
  calculateAttendancePercentage,
  formatAttendanceRecord,
} from '../utils/attendanceMetrics.js';
import {
  createRecommendation,
  formatDuration,
  getProductivityLevel,
  getSuggestedStudyDuration,
  getWeekBounds,
  isWithinRange,
  sortTasksByPriority,
  startOfDay,
} from '../utils/aiUtils.js';

const getCurrentTime = (date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

const buildAcademicContext = ({ attendanceRecords, now = new Date(), studySessions, tasks }) => {
  const startToday = startOfDay(now);
  const endToday = new Date(startToday);
  endToday.setDate(endToday.getDate() + 1);
  const { start: startWeek, end: endWeek } = getWeekBounds(now);
  const currentTime = getCurrentTime(now);
  const pendingTasks = tasks.filter((task) => task.status !== 'Completed');
  const completedTasks = tasks.filter((task) => task.status === 'Completed');
  const todayTasks = pendingTasks.filter((task) => isWithinRange(task.dueDate, startToday, endToday));
  const overdueTasks = pendingTasks.filter((task) => new Date(task.dueDate) < startToday);
  const attendance = attendanceRecords.map(formatAttendanceRecord);
  const totalClasses = attendance.reduce((total, record) => total + record.totalClasses, 0);
  const attendedClasses = attendance.reduce((total, record) => total + record.attendedClasses, 0);
  const overallAttendance = calculateAttendancePercentage(attendedClasses, totalClasses);
  const attendanceAlerts = attendance
    .filter((record) => record.percentage < 75)
    .sort((firstRecord, secondRecord) => firstRecord.percentage - secondRecord.percentage);
  const todayStudySessions = studySessions.filter(
    (session) => session.status !== 'Completed' && isWithinRange(session.date, startToday, endToday),
  );
  const upcomingStudySessions = studySessions.filter((session) => {
    if (session.status === 'Completed') {
      return false;
    }

    const sessionDate = new Date(session.date);
    return sessionDate > startToday || (isWithinRange(sessionDate, startToday, endToday) && session.startTime >= currentTime);
  });
  const missedStudySessions = studySessions.filter((session) => {
    if (session.status === 'Completed') {
      return false;
    }

    const sessionDate = new Date(session.date);
    return sessionDate < startToday || (isWithinRange(sessionDate, startToday, endToday) && session.startTime < currentTime);
  });
  const weeklyCompletedMinutes = studySessions
    .filter(
      (session) => session.status === 'Completed' && isWithinRange(session.date, startWeek, endWeek),
    )
    .reduce((total, session) => total + session.duration, 0);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const productivityScore = Math.round(completionRate * 0.5 + overallAttendance * 0.5);

  return {
    now,
    tasks: {
      all: tasks,
      completed: completedTasks,
      pending: pendingTasks,
      today: sortTasksByPriority(todayTasks),
      overdue: sortTasksByPriority(overdueTasks),
      highPriority: sortTasksByPriority(pendingTasks).filter((task) => task.priority === 'High'),
    },
    attendance: {
      all: attendance,
      alerts: attendanceAlerts,
      overall: overallAttendance,
    },
    study: {
      today: todayStudySessions,
      upcoming: upcomingStudySessions.slice(0, 3),
      missed: missedStudySessions,
      weeklyCompletedMinutes,
    },
    analytics: {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      completionRate,
      overallAttendance,
      productivityScore,
      productivityLevel: getProductivityLevel(productivityScore),
    },
  };
};

const getAcademicContext = async (userId) => {
  const query = { userId };
  const [tasks, attendanceRecords, studySessions] = await Promise.all([
    Task.find(query).sort({ dueDate: 1, createdAt: -1 }).lean(),
    Attendance.find(query).sort({ subject: 1 }).lean(),
    StudySession.find(query).sort({ date: 1, startTime: 1 }).lean(),
  ]);

  return buildAcademicContext({ attendanceRecords, studySessions, tasks });
};

const getHighestPrioritySubject = (context) => {
  const [attendanceAlert] = context.attendance.alerts;

  if (attendanceAlert) {
    return {
      subject: attendanceAlert.subject,
      priority: 'High',
      reason: `${attendanceAlert.percentage}% attendance is below the 75% safety target.`,
      type: 'attendance',
    };
  }

  const [highPriorityTask] = context.tasks.highPriority;

  if (highPriorityTask) {
    return {
      subject: highPriorityTask.subject,
      priority: 'High',
      reason: `Complete the high-priority task: ${highPriorityTask.title}.`,
      type: 'task',
    };
  }

  const [upcomingSession] = context.study.upcoming;

  if (upcomingSession) {
    return {
      subject: upcomingSession.subject,
      priority: 'Medium',
      reason: `Prepare for the upcoming ${upcomingSession.topic} study session.`,
      type: 'study-session',
    };
  }

  return {
    subject: 'General Revision',
    priority: 'Medium',
    reason: 'Use a short review session to keep academic momentum steady.',
    type: 'general',
  };
};

const buildAttendanceAlerts = (context) =>
  context.attendance.alerts.map((record) => ({
    subject: record.subject,
    percentage: record.percentage,
    classesNeeded: record.classesNeeded || 0,
    priority: record.percentage < 65 ? 'High' : 'Medium',
    message:
      record.classesNeeded === null
        ? `${record.subject} is below target and needs a discussion with your instructor.`
        : `${record.subject} is at ${record.percentage}%. Attend ${record.classesNeeded || 0} consecutive classes to reach 75%.`,
  }));

const buildTodayStudyPlan = (context, options = {}) => {
  const highestPrioritySubject = getHighestPrioritySubject(context);
  const defaultSuggestedDuration = getSuggestedStudyDuration(
    context.analytics.productivityScore,
    context.study.weeklyCompletedMinutes,
  );
  const suggestedDuration = options.focusMinutes
    ? {
        minutes: options.focusMinutes,
        label: `${options.focusMinutes}-minute focus session`,
        reason: 'This plan uses the focus duration you selected.',
      }
    : defaultSuggestedDuration;
  const targetSubject = options.subject || highestPrioritySubject.subject;
  const focusMinutes = suggestedDuration.minutes;
  const sessions = context.study.today.map((session) => ({
    type: 'scheduled',
    subject: session.subject,
    topic: session.topic,
    startTime: session.startTime,
    endTime: session.endTime,
    durationMinutes: session.duration,
    priority: session.priority,
    status: session.status,
    message: `Keep your planned ${session.duration}-minute study block for ${session.topic}.`,
  }));

  if (sessions.length < 3) {
    sessions.push({
      type: 'recommended',
      subject: targetSubject,
      topic: highestPrioritySubject.type === 'task' ? 'Priority task completion' : 'Focused revision',
      durationMinutes: focusMinutes,
      priority: highestPrioritySubject.priority,
      status: 'Suggested',
      message: `Reserve ${formatDuration(focusMinutes)} for ${targetSubject}. ${highestPrioritySubject.reason}`,
    });
  }

  if (context.tasks.today.length > 0 && sessions.length < 3) {
    const task = context.tasks.today[0];
    sessions.push({
      type: 'task-reminder',
      subject: task.subject,
      topic: task.title,
      durationMinutes: focusMinutes,
      priority: task.priority,
      status: 'Suggested',
      message: `Complete today's ${task.priority.toLowerCase()} priority task before your next revision block.`,
    });
  }

  return {
    title: 'Today\'s Study Plan',
    suggestedDuration,
    sessions: sessions.slice(0, 3),
    recoverySchedule:
      context.study.missed.length > 0
        ? {
            missedSessions: context.study.missed.length,
            message: `Recover ${context.study.missed.length} missed session${context.study.missed.length === 1 ? '' : 's'} with one ${formatDuration(focusMinutes)} block on each of the next few days.`,
          }
        : null,
  };
};

const buildRevisionPlan = (context, options = {}) => {
  const highestPrioritySubject = getHighestPrioritySubject(context);
  const suggestedDuration = getSuggestedStudyDuration(
    context.analytics.productivityScore,
    context.study.weeklyCompletedMinutes,
  );
  const subjectMap = new Map();

  context.attendance.alerts.forEach((record) => {
    subjectMap.set(record.subject, {
      subject: record.subject,
      priority: record.percentage < 65 ? 'High' : 'Medium',
      reason: `${record.percentage}% attendance requires immediate academic recovery.`,
      suggestedMinutes: options.focusMinutes || suggestedDuration.minutes,
    });
  });

  context.tasks.highPriority.forEach((task) => {
    if (!subjectMap.has(task.subject)) {
      subjectMap.set(task.subject, {
        subject: task.subject,
        priority: 'High',
        reason: `High-priority task pending: ${task.title}.`,
        suggestedMinutes: options.focusMinutes || suggestedDuration.minutes,
      });
    }
  });

  if (subjectMap.size === 0) {
    subjectMap.set(options.subject || highestPrioritySubject.subject, {
      subject: options.subject || highestPrioritySubject.subject,
      priority: highestPrioritySubject.priority,
      reason: highestPrioritySubject.reason,
      suggestedMinutes: options.focusMinutes || suggestedDuration.minutes,
    });
  }

  return {
    title: 'Smart Revision Plan',
    prioritySubjects: [...subjectMap.values()].slice(0, 3),
    reminders: context.study.upcoming.map((session) => ({
      subject: session.subject,
      topic: session.topic,
      time: session.startTime,
      message: `Review key notes before your ${session.topic} session at ${session.startTime}.`,
    })),
    recovery:
      context.study.missed.length > 0
        ? `Schedule ${context.study.missed.length} recovery session${context.study.missed.length === 1 ? '' : 's'} this week, starting with ${highestPrioritySubject.subject}.`
        : 'No missed study sessions need recovery right now.',
  };
};

const buildProductivityTips = (context) => {
  const suggestedDuration = getSuggestedStudyDuration(
    context.analytics.productivityScore,
    context.study.weeklyCompletedMinutes,
  );
  const tips = [];

  if (context.tasks.pending.length >= 4) {
    tips.push(
      createRecommendation(
        'pending-workload',
        'High',
        'Reduce the pending task queue',
        `${context.tasks.pending.length} tasks are still open. Start with the earliest high-priority due date.`,
        'Complete one task before starting a new low-priority activity.',
      ),
    );
  }

  if (context.attendance.alerts.length > 0) {
    tips.push(
      createRecommendation(
        'attendance-recovery',
        'High',
        'Protect your attendance',
        `${context.attendance.alerts.length} subject${context.attendance.alerts.length === 1 ? ' is' : 's are'} below the 75% target.`,
        `Prioritize attendance in ${context.attendance.alerts[0].subject} before optional study activities.`,
      ),
    );
  }

  if (context.study.weeklyCompletedMinutes < 180) {
    tips.push(
      createRecommendation(
        'study-hours',
        'Medium',
        'Build weekly study hours',
        `Only ${formatDuration(context.study.weeklyCompletedMinutes)} of completed study time is recorded this week.`,
        `Plan a ${suggestedDuration.label} today to rebuild steady progress.`,
      ),
    );
  }

  if (context.analytics.productivityScore < 50) {
    tips.push(
      createRecommendation(
        'small-focus-sessions',
        'Medium',
        'Restart with smaller focus sessions',
        `Your productivity score is ${context.analytics.productivityScore}. Smaller wins will create momentum.`,
        'Use a timer, remove distractions, and finish one clearly defined revision target.',
      ),
    );
  } else if (context.analytics.productivityScore >= 70) {
    tips.push(
      createRecommendation(
        'maintain-consistency',
        'Low',
        'Maintain your consistency',
        `Your productivity score is ${context.analytics.productivityScore}, which is in the ${context.analytics.productivityLevel} range.`,
        'Keep the same study rhythm and complete the next planned session on time.',
      ),
    );
  }

  if (tips.length === 0) {
    tips.push(
      createRecommendation(
        'steady-progress',
        'Low',
        'Keep a steady study rhythm',
        'Your current workload is balanced across tasks, attendance, and study sessions.',
        `Protect one ${suggestedDuration.label} for active recall or revision today.`,
      ),
    );
  }

  return {
    title: 'Productivity Tips',
    productivityScore: context.analytics.productivityScore,
    level: context.analytics.productivityLevel,
    tips: tips.slice(0, 4),
  };
};

const buildWeeklyRecommendations = (context) => {
  const highestPrioritySubject = getHighestPrioritySubject(context);
  const recommendations = [];

  if (context.tasks.overdue.length > 0) {
    recommendations.push(
      createRecommendation(
        'overdue-tasks',
        'High',
        'Clear overdue work',
        `${context.tasks.overdue.length} task${context.tasks.overdue.length === 1 ? ' is' : 's are'} overdue.`,
        `Begin with ${context.tasks.overdue[0].title} before adding new work.`,
      ),
    );
  }

  if (context.study.missed.length > 0) {
    recommendations.push(
      createRecommendation(
        'missed-sessions',
        'Medium',
        'Recover missed study sessions',
        `${context.study.missed.length} planned study session${context.study.missed.length === 1 ? ' was' : 's were'} missed.`,
        `Create a recovery schedule around ${highestPrioritySubject.subject}.`,
      ),
    );
  }

  recommendations.push(
    createRecommendation(
      'weekly-focus',
      highestPrioritySubject.priority,
      `Focus on ${highestPrioritySubject.subject}`,
      highestPrioritySubject.reason,
      `Use this week to improve task completion and keep attendance above 75%.`,
    ),
  );

  return {
    title: 'Weekly Recommendations',
    summary: `This week, protect ${highestPrioritySubject.subject} while completing ${context.analytics.pendingTasks} pending task${context.analytics.pendingTasks === 1 ? '' : 's'}.`,
    completedStudyMinutes: context.study.weeklyCompletedMinutes,
    recommendations: recommendations.slice(0, 3),
  };
};

const buildAiDashboardSummary = (context) => {
  const highestPrioritySubject = getHighestPrioritySubject(context);
  const suggestedStudyDuration = getSuggestedStudyDuration(
    context.analytics.productivityScore,
    context.study.weeklyCompletedMinutes,
  );
  const todayRecommendation = context.attendance.alerts[0]
    ? `Attend and revise ${context.attendance.alerts[0].subject} first; attendance is ${context.attendance.alerts[0].percentage}%.`
    : context.tasks.today[0]
      ? `Complete today's ${context.tasks.today[0].priority.toLowerCase()} priority task: ${context.tasks.today[0].title}.`
      : `Protect a ${suggestedStudyDuration.label} for ${highestPrioritySubject.subject}.`;

  return {
    generatedAt: context.now.toISOString(),
    engine: 'rule-based',
    productivity: context.analytics,
    todayRecommendation,
    highestPrioritySubject,
    suggestedStudyDuration,
    pendingTaskReminder: {
      count: context.analytics.pendingTasks,
      todayCount: context.tasks.today.length,
      message:
        context.analytics.pendingTasks > 0
          ? `${context.analytics.pendingTasks} task${context.analytics.pendingTasks === 1 ? '' : 's'} still need attention${context.tasks.today.length > 0 ? `, including ${context.tasks.today.length} due today` : ''}.`
          : 'All tasks are completed. Use the next study block for revision or planning.',
    },
    weeklyFocus: buildWeeklyRecommendations(context).summary,
  };
};

const getAiDashboardSummary = async (userId) => {
  const context = await getAcademicContext(userId);

  return buildAiDashboardSummary(context);
};

const getAiStudyPlan = async (userId, options) => {
  const context = await getAcademicContext(userId);

  return {
    generatedAt: context.now.toISOString(),
    engine: 'rule-based',
    analytics: context.analytics,
    ...buildTodayStudyPlan(context, options),
  };
};

const getAiRevisionPlan = async (userId, options) => {
  const context = await getAcademicContext(userId);

  return {
    generatedAt: context.now.toISOString(),
    engine: 'rule-based',
    attendanceAlerts: buildAttendanceAlerts(context),
    ...buildRevisionPlan(context, options),
  };
};

const getAiProductivityTips = async (userId) => {
  const context = await getAcademicContext(userId);

  return {
    generatedAt: context.now.toISOString(),
    engine: 'rule-based',
    attendanceAlerts: buildAttendanceAlerts(context),
    weeklyRecommendations: buildWeeklyRecommendations(context),
    ...buildProductivityTips(context),
  };
};

export {
  buildAcademicContext,
  buildAiDashboardSummary,
  getAiDashboardSummary,
  getAiProductivityTips,
  getAiRevisionPlan,
  getAiStudyPlan,
};
