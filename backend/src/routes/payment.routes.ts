import { Router } from 'express';
import { recordPayment, getPlayerFinancialStatement, getAllPayments } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getAllPayments);
router.post('/', authenticate, recordPayment);
router.get('/statement/:id', authenticate, getPlayerFinancialStatement);

export default router;
