import mongoose from 'mongoose';
import { calculateStudyDuration } from '../utils/studySessionUtils.js';

const studySessionSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required.'],
      trim: true,
      maxlength: [80, 'Subject must not exceed 80 characters.'],
    },
    topic: {
      type: String,
      required: [true, 'Topic is required.'],
      trim: true,
      maxlength: [120, 'Topic must not exceed 120 characters.'],
    },
    date: {
      type: Date,
      required: [true, 'Study date is required.'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required.'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must use the HH:mm format.'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required.'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must use the HH:mm format.'],
    },
    duration: {
      type: Number,
      required: [true, 'Study duration is required.'],
      min: [1, 'Study duration must be at least 1 minute.'],
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes must not exceed 500 characters.'],
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
  },
);

studySessionSchema.pre('validate', function setDurationFromTimes() {
  const duration = calculateStudyDuration(this.startTime, this.endTime);

  if (!duration) {
    this.invalidate('endTime', 'End time must be later than start time.');
    return;
  }

  this.duration = duration;
});

studySessionSchema.index({ userId: 1, status: 1, date: 1, startTime: 1 });

studySessionSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    return returnedObject;
  },
});

const StudySession = mongoose.model('StudySession', studySessionSchema);

export default StudySession;
