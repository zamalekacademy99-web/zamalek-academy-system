import { Router } from 'express';
import { getAllCoaches, getCoachById, createCoach, updateCoach, deleteCoach } from '../controllers/coach.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import type { Request, Response } from 'express';

const router = Router();

// Diagnostic: test this path is reachable without auth
router.get('/test-me', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'coaches route is alive', route: 'GET /api/v1/coaches/test-me' });
});

router.get('/', authenticate, getAllCoaches);
router.get('/:id', authenticate, getCoachById);
router.post('/', authenticate, authorize(['SUPER_ADMIN']), createCoach);
router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), updateCoach);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN']), deleteCoach);

export default router;
