import AttendanceForm from './AttendanceForm.jsx';
import useDialogAccessibility from '../hooks/useDialogAccessibility.js';

function AttendanceModal({ attendance, errorMessage, isOpen, isSubmitting, onClose, onSubmit }) {
  const dialogRef = useDialogAccessibility(isOpen, onClose);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center sm:justify-center" onMouseDown={onClose}>
      <div
        aria-labelledby="attendance-modal-title"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        onMouseDown={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        tabIndex="-1"
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-300">
              Attendance Tracker
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white" id="attendance-modal-title">
              {attendance ? 'Edit Attendance' : 'Add Attendance'}
            </h2>
          </div>
          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            disabled={isSubmitting}
            aria-label="Close attendance dialog"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        {errorMessage ? (
          <div className="mb-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300">
            {errorMessage}
          </div>
        ) : null}

        <AttendanceForm attendance={attendance} isSubmitting={isSubmitting} key={attendance?.id || 'new-attendance'} onSubmit={onSubmit} />
      </div>
    </div>
  );
}

export default AttendanceModal;
