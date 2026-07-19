import { Router } from 'express';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
