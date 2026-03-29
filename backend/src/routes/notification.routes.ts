import { Router } from 'express';
import { sendNotification, getSentHistory, markNotificationRead } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', sendNotification);
router.get('/history', getSentHistory);
router.patch('/:id/read', authenticate, markNotificationRead);

export default router;
