import { Router } from 'express';
import { sendMessageToParent, getMessagesForParent, markMessageRead } from '../controllers/message.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['SUPER_ADMIN', 'ADMIN', 'COACH']), sendMessageToParent);
router.get('/parent/:parentId', getMessagesForParent);
router.patch('/:id/read', markMessageRead);

export default router;
