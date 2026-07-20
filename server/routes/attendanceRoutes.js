import { Router } from 'express';
import {
  createAttendance,
  deleteAttendance,
  getAttendanceById,
  getAttendanceRecords,
  updateAttendance,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateAttendanceCreateInput,
  validateAttendanceUpdateInput,
} from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.route('/').post(validateAttendanceCreateInput, createAttendance).get(getAttendanceRecords);
router
  .route('/:id')
  .get(getAttendanceById)
  .put(validateAttendanceUpdateInput, updateAttendance)
  .delete(deleteAttendance);

export default router;
