import { Router } from 'express';
import { getAllSchedules, createSchedule } from '../controllers/schedule.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getAllSchedules);
router.post('/', authenticate, createSchedule); // Admins can create schedules

export default router;
