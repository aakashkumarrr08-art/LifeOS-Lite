const calculateAttendancePercentage = (attendedClasses, totalClasses) => {
  if (!totalClasses) {
    return 0;
  }

  return Number(((attendedClasses / totalClasses) * 100).toFixed(1));
};

const calculateClassesNeeded = (attendedClasses, totalClasses, minimumAttendance = 75) => {
  const percentage = calculateAttendancePercentage(attendedClasses, totalClasses);

  if (percentage >= minimumAttendance) {
    return 0;
  }

  if (minimumAttendance >= 100) {
    return null;
  }

  return Math.ceil(
    ((minimumAttendance / 100) * totalClasses - attendedClasses) /
      (1 - minimumAttendance / 100),
  );
};

const formatAttendanceRecord = (record) => {
  const attendance = typeof record.toJSON === 'function' ? record.toJSON() : { ...record };
  const percentage = calculateAttendancePercentage(attendance.attendedClasses, attendance.totalClasses);
  const classesNeeded = calculateClassesNeeded(
    attendance.attendedClasses,
    attendance.totalClasses,
    attendance.minimumAttendance,
  );

  return {
    ...attendance,
    percentage,
    classesNeeded,
    isBelowMinimum: percentage < attendance.minimumAttendance,
  };
};

export { calculateAttendancePercentage, calculateClassesNeeded, formatAttendanceRecord };
