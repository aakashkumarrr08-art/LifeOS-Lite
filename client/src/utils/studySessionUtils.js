const getDateKey = (value) => new Date(value).toISOString().slice(0, 10);

const getTodayDateKey = () => getDateKey(new Date());

const formatStudyDate = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  }).format(new Date(date));

const formatDuration = (duration) => {
  const totalMinutes = Number(duration) || 0;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return 0;
  }

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  return endTotalMinutes > startTotalMinutes ? endTotalMinutes - startTotalMinutes : 0;
};

const getWeekDates = (referenceDate = new Date()) => {
  const monday = new Date(referenceDate);
  const dayOfWeek = monday.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(monday.getDate() - daysSinceMonday);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
};

export {
  calculateDuration,
  formatDuration,
  formatStudyDate,
  getDateKey,
  getTodayDateKey,
  getWeekDates,
};
