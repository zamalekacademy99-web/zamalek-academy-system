import { Router } from 'express';
import { sendNotification, getSentHistory, markNotificationRead, markAllNotificationsRead } from '../controllers/notification.controller';
import { submitRequest } from '../controllers/parent.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', sendNotification);
router.get('/history', getSentHistory);
router.patch('/read-all', authenticate, markAllNotificationsRead);
router.patch('/:id/read', authenticate, markNotificationRead);
router.post('/parent-request', authenticate, submitRequest);

export default router;
