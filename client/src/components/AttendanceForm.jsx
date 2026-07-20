import { useState } from 'react';

const initialFormData = {
  subject: '',
  totalClasses: '',
  attendedClasses: '',
  minimumAttendance: '75',
};

const getAttendanceFormData = (attendance) =>
  attendance
    ? {
        subject: attendance.subject || '',
        totalClasses: String(attendance.totalClasses ?? ''),
        attendedClasses: String(attendance.attendedClasses ?? ''),
        minimumAttendance: String(attendance.minimumAttendance ?? 75),
      }
    : initialFormData;

function AttendanceForm({ attendance, isSubmitting, onSubmit }) {
  const [formData, setFormData] = useState(getAttendanceFormData(attendance));
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const nextErrors = {};
    const totalClasses = Number(formData.totalClasses);
    const attendedClasses = Number(formData.attendedClasses);
    const minimumAttendance = Number(formData.minimumAttendance);

    if (!formData.subject.trim()) {
      nextErrors.subject = 'Subject is required.';
    } else if (formData.subject.trim().length > 80) {
      nextErrors.subject = 'Subject must not exceed 80 characters.';
    }

    if (!Number.isSafeInteger(totalClasses) || totalClasses < 1) {
      nextErrors.totalClasses = 'Enter a whole number of at least 1.';
    }

    if (!Number.isSafeInteger(attendedClasses) || attendedClasses < 0) {
      nextErrors.attendedClasses = 'Enter a whole number of at least 0.';
    } else if (Number.isSafeInteger(totalClasses) && attendedClasses > totalClasses) {
      nextErrors.attendedClasses = 'Attended classes cannot exceed total classes.';
    }

    if (!Number.isFinite(minimumAttendance) || minimumAttendance < 1 || minimumAttendance > 100) {
      nextErrors.minimumAttendance = 'Enter a percentage between 1 and 100.';
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
      subject: formData.subject.trim(),
      totalClasses: Number(formData.totalClasses),
      attendedClasses: Number(formData.attendedClasses),
      minimumAttendance: Number(formData.minimumAttendance),
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="attendance-subject">
          Subject
        </label>
        <input
          className="form-input"
          id="attendance-subject"
          name="subject"
          onChange={handleChange}
          placeholder="Database Systems"
          type="text"
          value={formData.subject}
        />
        {errors.subject ? <p className="form-error">{errors.subject}</p> : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="attendance-total">
            Total Classes
          </label>
          <input
            className="form-input"
            id="attendance-total"
            min="1"
            name="totalClasses"
            onChange={handleChange}
            placeholder="40"
            step="1"
            type="number"
            value={formData.totalClasses}
          />
          {errors.totalClasses ? <p className="form-error">{errors.totalClasses}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="attendance-attended">
            Classes Attended
          </label>
          <input
            className="form-input"
            id="attendance-attended"
            min="0"
            name="attendedClasses"
            onChange={handleChange}
            placeholder="32"
            step="1"
            type="number"
            value={formData.attendedClasses}
          />
          {errors.attendedClasses ? <p className="form-error">{errors.attendedClasses}</p> : null}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="attendance-minimum">
          Minimum Attendance Target (%)
        </label>
        <input
          className="form-input"
          id="attendance-minimum"
          max="100"
          min="1"
          name="minimumAttendance"
          onChange={handleChange}
          step="0.1"
          type="number"
          value={formData.minimumAttendance}
        />
        {errors.minimumAttendance ? <p className="form-error">{errors.minimumAttendance}</p> : null}
      </div>

      <button className="primary-button w-full justify-center" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Saving Attendance...' : attendance ? 'Save Changes' : 'Add Attendance Record'}
      </button>
    </form>
  );
}

export default AttendanceForm;
