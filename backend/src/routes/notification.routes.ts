import { Router } from 'express';
import { sendNotification, getSentHistory } from '../controllers/notification.controller';

const router = Router();

router.post('/', sendNotification);
router.get('/history', getSentHistory);

export default router;
