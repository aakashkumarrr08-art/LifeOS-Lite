const startOfDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getWeekBounds = (date) => {
  const start = startOfDay(date);
  const dayOfWeek = start.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  start.setDate(start.getDate() - daysSinceMonday);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return { start, end };
};

const isWithinRange = (value, start, end) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date >= start && date < end;
};

const taskPriorityRank = {
  High: 0,
  Medium: 1,
  Low: 2,
};

const sortTasksByPriority = (tasks) =>
  [...tasks].sort((firstTask, secondTask) => {
    const priorityDifference =
      (taskPriorityRank[firstTask.priority] ?? 3) - (taskPriorityRank[secondTask.priority] ?? 3);

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return new Date(firstTask.dueDate) - new Date(secondTask.dueDate);
  });

const getProductivityLevel = (score) => {
  if (score >= 85) {
    return 'Excellent';
  }

  if (score >= 70) {
    return 'Good';
  }

  if (score >= 50) {
    return 'Average';
  }

  return 'Needs Improvement';
};

const getSuggestedStudyDuration = (productivityScore, weeklyCompletedMinutes) => {
  if (productivityScore < 50) {
    return {
      minutes: 25,
      label: '25-minute focus session',
      reason: 'Shorter sessions make it easier to restart a consistent study habit.',
    };
  }

  if (productivityScore < 70 || weeklyCompletedMinutes < 180) {
    return {
      minutes: 45,
      label: '45-minute focus session',
      reason: 'A focused block will help close this week\'s study gap without creating overload.',
    };
  }

  return {
    minutes: 60,
    label: '60-minute deep-work session',
    reason: 'Your current momentum supports a longer revision block.',
  };
};

const createRecommendation = (id, priority, title, message, action, metadata = {}) => ({
  id,
  priority,
  title,
  message,
  action,
  metadata,
});

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} minutes`;
  }

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours === 1 ? '' : 's'}`;
};

export {
  createRecommendation,
  formatDuration,
  getProductivityLevel,
  getSuggestedStudyDuration,
  getWeekBounds,
  isWithinRange,
  sortTasksByPriority,
  startOfDay,
};
