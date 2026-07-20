const statusOptions = ['All Statuses', 'Pending', 'In Progress', 'Completed'];
const priorityOptions = ['All Priorities', 'Low', 'Medium', 'High'];

function TaskFilter({ filters, onChange, onReset, subjects }) {
  const handleChange = (event) => {
    onChange({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div className="dashboard-panel">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 gap-4 sm:grid-cols-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Status
            <select className="form-input mt-2" name="status" onChange={handleChange} value={filters.status}>
              {statusOptions.map((option) => (
                <option key={option} value={option === 'All Statuses' ? '' : option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Priority
            <select className="form-input mt-2" name="priority" onChange={handleChange} value={filters.priority}>
              {priorityOptions.map((option) => (
                <option key={option} value={option === 'All Priorities' ? '' : option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Subject
            <select className="form-input mt-2" name="subject" onChange={handleChange} value={filters.subject}>
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button className="secondary-button w-full justify-center xl:w-auto" onClick={onReset} type="button">
          Reset Filters
        </button>
      </div>
    </div>
  );
}

export default TaskFilter;

