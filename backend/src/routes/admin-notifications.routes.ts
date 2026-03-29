import { Router } from 'express';
import { getAdminNotifications, updateRequestStatus } from '../controllers/admin-notifications.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, authorize(['ADMIN', 'SUPER_ADMIN']));

router.get('/', getAdminNotifications);
router.patch('/:id/status', updateRequestStatus);

export default router;
