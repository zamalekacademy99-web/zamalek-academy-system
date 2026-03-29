import { Router } from 'express';
import { recordPayment, getPlayerFinancialStatement, getAllPayments } from '../controllers/payment.controller';
import { authenticate, authorize, checkCoachPermission } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticate, authorize([Role.ADMIN, 'COACH' as any]), checkCoachPermission('can_manage_payments'), getAllPayments);
router.post('/', authenticate, authorize([Role.ADMIN, 'COACH' as any]), checkCoachPermission('can_manage_payments'), recordPayment);
router.get('/statement/:id', authenticate, authorize([Role.ADMIN, 'COACH' as any]), checkCoachPermission('can_manage_payments'), getPlayerFinancialStatement);

export default router;
