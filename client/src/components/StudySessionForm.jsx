import { useEffect, useState } from 'react';
import { calculateDuration, formatDuration, getTodayDateKey } from '../utils/studySessionUtils.js';

const getInitialFormData = () => ({
  subject: '',
  topic: '',
  date: getTodayDateKey(),
  startTime: '09:00',
  endTime: '10:00',
  priority: 'Medium',
  status: 'Pending',
  notes: '',
});

const getStudySessionFormData = (studySession) =>
  studySession
    ? {
        subject: studySession.subject || '',
        topic: studySession.topic || '',
        date: studySession.date ? new Date(studySession.date).toISOString().slice(0, 10) : getTodayDateKey(),
        startTime: studySession.startTime || '09:00',
        endTime: studySession.endTime || '10:00',
        priority: studySession.priority || 'Medium',
        status: studySession.status || 'Pending',
        notes: studySession.notes || '',
      }
    : getInitialFormData();

function StudySessionForm({ isSubmitting, onSubmit, studySession }) {
  const [formData, setFormData] = useState(getStudySessionFormData(studySession));
  const [errors, setErrors] = useState({});
  const duration = calculateDuration(formData.startTime, formData.endTime);

  useEffect(() => {
    setFormData(getStudySessionFormData(studySession));
    setErrors({});
  }, [studySession]);

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.subject.trim()) {
      nextErrors.subject = 'Subject is required.';
    } else if (formData.subject.trim().length > 80) {
      nextErrors.subject = 'Subject must not exceed 80 characters.';
    }

    if (!formData.topic.trim()) {
      nextErrors.topic = 'Topic is required.';
    } else if (formData.topic.trim().length > 120) {
      nextErrors.topic = 'Topic must not exceed 120 characters.';
    }

    if (!formData.date) {
      nextErrors.date = 'Study date is required.';
    }

    if (!formData.startTime) {
      nextErrors.startTime = 'Start time is required.';
    }

    if (!formData.endTime) {
      nextErrors.endTime = 'End time is required.';
    } else if (!duration) {
      nextErrors.endTime = 'End time must be later than start time.';
    }

    if (formData.notes.trim().length > 500) {
      nextErrors.notes = 'Notes must not exceed 500 characters.';
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
      subject: formData.subject.trim(),
      topic: formData.topic.trim(),
      notes: formData.notes.trim(),
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="study-subject">
            Subject
          </label>
          <input
            className="form-input"
            id="study-subject"
            name="subject"
            onChange={handleChange}
            placeholder="Database Systems"
            type="text"
            value={formData.subject}
          />
          {errors.subject ? <p className="form-error">{errors.subject}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="study-topic">
            Topic
          </label>
          <input
            className="form-input"
            id="study-topic"
            name="topic"
            onChange={handleChange}
            placeholder="Normalization and indexing"
            type="text"
            value={formData.topic}
          />
          {errors.topic ? <p className="form-error">{errors.topic}</p> : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="study-date">
            Date
          </label>
          <input
            className="form-input"
            id="study-date"
            name="date"
            onChange={handleChange}
            type="date"
            value={formData.date}
          />
          {errors.date ? <p className="form-error">{errors.date}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="study-start-time">
            Start Time
          </label>
          <input
            className="form-input"
            id="study-start-time"
            name="startTime"
            onChange={handleChange}
            type="time"
            value={formData.startTime}
          />
          {errors.startTime ? <p className="form-error">{errors.startTime}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="study-end-time">
            End Time
          </label>
          <input
            className="form-input"
            id="study-end-time"
            name="endTime"
            onChange={handleChange}
            type="time"
            value={formData.endTime}
          />
          {errors.endTime ? <p className="form-error">{errors.endTime}</p> : null}
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-800 dark:text-cyan-200">
        Planned duration: <span className="font-semibold">{duration ? formatDuration(duration) : 'Choose a valid time range'}</span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="study-priority">
            Priority
          </label>
          <select className="form-input" id="study-priority" name="priority" onChange={handleChange} value={formData.priority}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="study-status">
            Status
          </label>
          <select className="form-input" id="study-status" name="status" onChange={handleChange} value={formData.status}>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="study-notes">
          Notes <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          className="form-input min-h-28 resize-y"
          id="study-notes"
          name="notes"
          onChange={handleChange}
          placeholder="Add a revision goal, resource, or short reminder."
          value={formData.notes}
        />
        {errors.notes ? <p className="form-error">{errors.notes}</p> : null}
      </div>

      <button className="primary-button w-full justify-center" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Saving Session...' : studySession ? 'Save Changes' : 'Add Study Session'}
      </button>
    </form>
  );
}

export default StudySessionForm;
