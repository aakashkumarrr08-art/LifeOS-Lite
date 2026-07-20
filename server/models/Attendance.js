import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required.'],
      trim: true,
      maxlength: [80, 'Subject must not exceed 80 characters.'],
    },
    totalClasses: {
      type: Number,
      required: [true, 'Total classes is required.'],
      min: [1, 'Total classes must be at least 1.'],
      validate: {
        validator: Number.isInteger,
        message: 'Total classes must be a whole number.',
      },
    },
    attendedClasses: {
      type: Number,
      required: [true, 'Attended classes is required.'],
      min: [0, 'Attended classes cannot be negative.'],
      validate: {
        validator: Number.isInteger,
        message: 'Attended classes must be a whole number.',
      },
    },
    minimumAttendance: {
      type: Number,
      default: 75,
      min: [1, 'Minimum attendance must be at least 1%.'],
      max: [100, 'Minimum attendance cannot exceed 100%.'],
    },
  },
  {
    timestamps: true,
  },
);

attendanceSchema.pre('validate', function validateAttendedClasses() {
  if (this.attendedClasses > this.totalClasses) {
    this.invalidate('attendedClasses', 'Attended classes cannot exceed total classes.');
  }
});

attendanceSchema.index({ userId: 1, subject: 1 });

attendanceSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    return returnedObject;
  },
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
