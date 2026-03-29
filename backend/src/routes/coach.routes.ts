import { Router } from 'express';
import { getAllCoaches, getCoachById, createCoach, updateCoach, deleteCoach, createCoachAccount, resetCoachPassword, normalizeCoachEmail, getCoachProfile } from '../controllers/coach.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import type { Request, Response } from 'express';

const router = Router();


// Diagnostic: test this path is reachable without auth
router.get('/test-me', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'coaches route is alive', route: 'GET /api/v1/coaches/test-me' });
});

router.get('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), getAllCoaches);
router.get('/profile', authenticate, getCoachProfile); // Self profile for coaches
router.get('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), getCoachById);
router.post('/', authenticate, authorize(['SUPER_ADMIN']), createCoach);
router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), updateCoach);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN']), deleteCoach);

// Auto-create login account for a coach
router.post('/:id/account', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), createCoachAccount);
router.post('/:id/create-account', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), createCoachAccount);

// Reset coach password to phone number
router.post('/:id/reset-password', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), resetCoachPassword);

// Normalize coach email to English (No Arabic)
router.post('/:id/normalize-email', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), normalizeCoachEmail);


export default router;
