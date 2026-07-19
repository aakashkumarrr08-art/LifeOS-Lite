const MS_PER_DAY = 1000 * 60 * 60 * 24;
const UPCOMING_EXAM_DATE = new Date('2026-08-18T09:00:00.000Z');

const getDashboardData = (req, res) => {
  const now = new Date();
  const daysRemaining = Math.max(
    Math.ceil((UPCOMING_EXAM_DATE.getTime() - now.getTime()) / MS_PER_DAY),
    0,
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
          id: 'todayTasks',
          label: "Today's Tasks",
          value: 7,
          change: '+2 from yesterday',
          accent: 'cyan',
        },
        {
          id: 'completedTasks',
          label: 'Completed Tasks',
          value: 4,
          change: '57% completion rate',
          accent: 'emerald',
        },
        {
          id: 'attendance',
          label: 'Attendance',
          value: '91%',
          change: 'Above semester target',
          accent: 'amber',
        },
        {
          id: 'studyHours',
          label: 'Study Hours',
          value: '5.5h',
          change: '1.2h deep work today',
          accent: 'violet',
        },
      ],
      todayTasks: [
        {
          id: 'task-1',
          title: 'Complete operating systems revision quiz',
          time: '08:30 AM',
          category: 'Revision',
          priority: 'High',
        },
        {
          id: 'task-2',
          title: 'Submit database normalization assignment',
          time: '11:00 AM',
          category: 'Assignment',
          priority: 'High',
        },
        {
          id: 'task-3',
          title: 'Attend compiler design lecture',
          time: '01:30 PM',
          category: 'Lecture',
          priority: 'Medium',
        },
        {
          id: 'task-4',
          title: 'Review networking flashcards',
          time: '06:00 PM',
          category: 'Self Study',
          priority: 'Low',
        },
      ],
      studyProgress: {
        completedPercentage: 72,
        weeklyGoalHours: 24,
        completedHours: 17.5,
        focusSessions: 9,
        currentStreak: 6,
      },
      attendance: {
        percentage: 91,
        attendedClasses: 64,
        totalClasses: 70,
        missedClasses: 6,
        status: 'Safe Zone',
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
};

export { getDashboardData };

