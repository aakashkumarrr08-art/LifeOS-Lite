import { useEffect, useState } from 'react';
import AttendanceCard from '../components/AttendanceCard.jsx';
import AttendanceModal from '../components/AttendanceModal.jsx';
import {
  createAttendance,
  deleteAttendance,
  getAttendanceRecords,
  updateAttendance,
} from '../services/attendanceService.js';

const getApiErrorMessage = (error) =>
  error.response?.data?.errors?.[0]?.message ||
  error.response?.data?.message ||
  'Unable to complete the attendance action right now.';

const formatPercentage = (percentage) => {
  const value = Number(percentage) || 0;
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
};

function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [modalError, setModalError] = useState('');

  const loadAttendanceRecords = async () => {
    try {
      setErrorMessage('');
      setIsLoading(true);
      const response = await getAttendanceRecords();
      setAttendanceRecords(response.attendanceRecords);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceRecords();
  }, []);

  const openCreateModal = () => {
    setSelectedAttendance(null);
    setIsModalOpen(true);
    setActionMessage('');
    setModalError('');
  };

  const openEditModal = (attendance) => {
    setSelectedAttendance(attendance);
    setIsModalOpen(true);
    setActionMessage('');
    setModalError('');
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setSelectedAttendance(null);
      setModalError('');
    }
  };

  const handleAttendanceSubmit = async (payload) => {
    try {
      setModalError('');
      setIsSubmitting(true);

      if (selectedAttendance) {
        await updateAttendance(selectedAttendance.id, payload);
        setActionMessage('Attendance record updated successfully.');
      } else {
        await createAttendance(payload);
        setActionMessage('Attendance record added successfully.');
      }

      setIsModalOpen(false);
      setSelectedAttendance(null);
      await loadAttendanceRecords();
    } catch (error) {
      setModalError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (attendance) => {
    const shouldDelete = window.confirm(
      `Delete the attendance record for "${attendance.subject}"? This action cannot be undone.`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setErrorMessage('');
      await deleteAttendance(attendance.id);
      setActionMessage(`Deleted attendance for "${attendance.subject}".`);
      await loadAttendanceRecords();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const totalClasses = attendanceRecords.reduce((total, record) => total + record.totalClasses, 0);
  const attendedClasses = attendanceRecords.reduce((total, record) => total + record.attendedClasses, 0);
  const overallPercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
  const belowSeventyFiveRecords = attendanceRecords.filter((record) => Number(record.percentage) < 75);
  const classesNeeded = attendanceRecords.reduce(
    (total, record) => total + (Number(record.classesNeeded) || 0),
    0,
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="dashboard-panel h-44 animate-pulse" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div className="dashboard-panel h-32 animate-pulse" key={index} />
          ))}
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <div className="dashboard-panel h-64 animate-pulse" key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-8 text-white shadow-soft">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
              Phase 5 Attendance
            </span>
            <h2 className="text-4xl font-semibold tracking-tight">Protect your attendance before it becomes a shortage.</h2>
            <p className="text-base leading-7 text-slate-200">
              Track every subject, see your live attendance percentage, and know exactly how many future classes are needed to reach your target.
            </p>
          </div>
          <button className="primary-button justify-center border border-white/10 bg-white text-slate-950 hover:bg-slate-100 dark:bg-white dark:text-slate-950" onClick={openCreateModal} type="button">
            Add Attendance
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="dashboard-panel">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overall Attendance</p>
          <p className={`mt-4 text-4xl font-semibold tracking-tight ${overallPercentage < 75 && totalClasses > 0 ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300'}`}>
            {formatPercentage(overallPercentage)}
          </p>
        </div>
        <div className="dashboard-panel">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Classes Attended</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {attendedClasses} / {totalClasses}
          </p>
        </div>
        <div className="dashboard-panel">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Below 75%</p>
          <p className={`mt-4 text-4xl font-semibold tracking-tight ${belowSeventyFiveRecords.length > 0 ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300'}`}>
            {belowSeventyFiveRecords.length}
          </p>
        </div>
        <div className="dashboard-panel">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Classes Needed</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-cyan-600 dark:text-cyan-300">{classesNeeded}</p>
        </div>
      </div>

      {actionMessage ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-medium text-emerald-700 dark:text-emerald-300">
          {actionMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm font-medium text-rose-700 dark:text-rose-300">
          {errorMessage}
        </div>
      ) : null}

      {attendanceRecords.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {attendanceRecords.map((attendance) => (
            <AttendanceCard
              attendance={attendance}
              key={attendance.id}
              onDelete={handleDelete}
              onEdit={openEditModal}
            />
          ))}
        </div>
      ) : (
        <div className="dashboard-panel mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-300">Attendance Tracker</p>
          <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Add your first subject to start protecting your attendance.
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Your attendance summary and dashboard cards will update from your real records.
          </p>
          <button className="primary-button mt-7" onClick={openCreateModal} type="button">
            Add Your First Subject
          </button>
        </div>
      )}

      <AttendanceModal
        attendance={selectedAttendance}
        errorMessage={modalError}
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleAttendanceSubmit}
      />
    </section>
  );
}

export default AttendancePage;
