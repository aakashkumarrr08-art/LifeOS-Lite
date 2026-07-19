const architectureCards = [
  {
    title: 'Backend Foundation',
    description:
      'Express server, MongoDB configuration, MVC folders, middleware, and environment-ready startup flow.',
  },
  {
    title: 'Frontend Foundation',
    description:
      'React with Vite, Tailwind CSS, React Router, Axios, and a dark-mode-ready starter interface.',
  },
  {
    title: 'Exam-Friendly Structure',
    description:
      'Clean folders and simple code so each file is easy to explain during the viva demonstration.',
  },
];

const upcomingModules = [
  'Authentication',
  'Dashboard',
  'Study Planner',
  'Task Manager',
  'Attendance Tracker',
  'AI Assistant',
  'Analytics',
];

function SetupPage() {
  return (
    <section className="space-y-10">
      <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-10 px-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-sm font-medium text-cyan-700 dark:text-cyan-300">
              Student Productivity Dashboard
            </div>
            <div className="space-y-4">
              <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
                A clean full-stack starter built for a professional semester exam demo.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                This first phase focuses only on project setup. The backend and frontend are now
                connected through a production-friendly structure so future modules can be added in
                small, explainable steps.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-6 text-slate-100 dark:bg-slate-800">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
              Current Scope
            </p>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li>React + Vite project base</li>
              <li>Tailwind CSS configuration</li>
              <li>Express server bootstrap</li>
              <li>MongoDB Atlas connection setup</li>
              <li>Environment and README documentation</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {architectureCards.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{card.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {card.description}
            </p>
          </article>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 p-8 text-white shadow-soft dark:border-slate-800">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
          Modules Planned For Later Phases
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {upcomingModules.map((module) => (
            <span
              key={module}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium"
            >
              {module}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SetupPage;

