import { Router } from 'express';
import { recordBatchAttendance, getAttendanceBySchedule } from '../controllers/attendance.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getAttendanceBySchedule);
router.post('/batch', authenticate, recordBatchAttendance);

export default router;
