import { Router } from 'express';
import { getAllCoaches, createCoach, updateCoach, deleteCoach } from '../controllers/coach.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getAllCoaches);
router.post('/', authenticate, authorize(['SUPER_ADMIN']), createCoach);
router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), updateCoach);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN']), deleteCoach);

export default router;
