const studyTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const isValidStudyTime = (time) => typeof time === 'string' && studyTimePattern.test(time);

const calculateStudyDuration = (startTime, endTime) => {
  if (!isValidStudyTime(startTime) || !isValidStudyTime(endTime)) {
    return null;
  }

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  return endTotalMinutes > startTotalMinutes ? endTotalMinutes - startTotalMinutes : null;
};

export { calculateStudyDuration, isValidStudyTime };
