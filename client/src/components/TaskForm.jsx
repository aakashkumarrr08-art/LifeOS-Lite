import { useState } from 'react';

const initialFormData = {
  title: '',
  description: '',
  subject: '',
  priority: 'Medium',
  status: 'Pending',
  dueDate: '',
};

const formatDateForInput = (dateValue) => {
  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getTaskFormData = (task) =>
  task
    ? {
        title: task.title || '',
        description: task.description || '',
        subject: task.subject || '',
        priority: task.priority || 'Medium',
        status: task.status || 'Pending',
        dueDate: formatDateForInput(task.dueDate),
      }
    : initialFormData;

function TaskForm({ isSubmitting, onSubmit, task }) {
  const [formData, setFormData] = useState(getTaskFormData(task));
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.title.trim()) {
      nextErrors.title = 'Task title is required.';
    } else if (formData.title.trim().length < 2) {
      nextErrors.title = 'Task title must be at least 2 characters long.';
    }

    if (formData.description.trim().length > 500) {
      nextErrors.description = 'Description must not exceed 500 characters.';
    }

    if (!formData.subject.trim()) {
      nextErrors.subject = 'Subject is required.';
    }

    if (!formData.dueDate) {
      nextErrors.dueDate = 'Due date is required.';
    }

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onSubmit({
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      subject: formData.subject.trim(),
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="task-title">
          Task Title
        </label>
        <input
          className="form-input"
          id="task-title"
          name="title"
          onChange={handleChange}
          placeholder="Finish database assignment"
          type="text"
          value={formData.title}
        />
        {errors.title ? <p className="form-error">{errors.title}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="task-description">
          Description
        </label>
        <textarea
          className="form-input min-h-28 resize-y"
          id="task-description"
          name="description"
          onChange={handleChange}
          placeholder="Add a short note about what needs to be completed."
          value={formData.description}
        />
        {errors.description ? <p className="form-error">{errors.description}</p> : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="task-subject">
            Subject
          </label>
          <input
            className="form-input"
            id="task-subject"
            name="subject"
            onChange={handleChange}
            placeholder="Database Systems"
            type="text"
            value={formData.subject}
          />
          {errors.subject ? <p className="form-error">{errors.subject}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="task-due-date">
            Due Date
          </label>
          <input
            className="form-input"
            id="task-due-date"
            name="dueDate"
            onChange={handleChange}
            type="date"
            value={formData.dueDate}
          />
          {errors.dueDate ? <p className="form-error">{errors.dueDate}</p> : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="task-priority">
            Priority
          </label>
          <select className="form-input" id="task-priority" name="priority" onChange={handleChange} value={formData.priority}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="task-status">
            Status
          </label>
          <select className="form-input" id="task-status" name="status" onChange={handleChange} value={formData.status}>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <button className="primary-button w-full justify-center" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Saving Task...' : task ? 'Save Changes' : 'Create Task'}
      </button>
    </form>
  );
}

export default TaskForm;
