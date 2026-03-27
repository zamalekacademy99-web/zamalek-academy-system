import { Router } from 'express';
import {
    getDashboard, getChildren, getChildAttendance,
    getChildPayments, getChildEvaluations, getNotifications, submitRequest
} from '../controllers/parent.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Strict authorizaton: must be logged in AND have PARENT role
router.use(authenticate, authorize(['PARENT']));

router.get('/dashboard', getDashboard);
router.get('/children', getChildren);
router.get('/attendance/:childId', getChildAttendance);
router.get('/payments/:childId', getChildPayments);
router.get('/evaluations/:childId', getChildEvaluations);
router.get('/notifications', getNotifications);
router.post('/request', submitRequest);

export default router;
