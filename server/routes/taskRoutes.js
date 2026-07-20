import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateTaskCreateInput, validateTaskUpdateInput } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(protect);

router.route('/').post(validateTaskCreateInput, createTask).get(getTasks);
router
  .route('/:id')
  .get(getTaskById)
  .put(validateTaskUpdateInput, updateTask)
  .delete(deleteTask);

export default router;

