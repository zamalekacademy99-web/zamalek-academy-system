import { Router } from 'express';
import { getAllPlayers, getPlayerById, registerPlayer, updatePlayer, deletePlayer } from '../controllers/player.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import type { Request, Response } from 'express';

import { Role } from '@prisma/client';

const router = Router();

// Diagnostic: test this path is reachable without auth
router.get('/test-me', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'players route is alive', route: 'GET /api/v1/players/test-me' });
});

router.get('/', authenticate, authorize([Role.ADMIN, Role.SUPER_ADMIN, Role.COACH]), getAllPlayers);
router.post('/register', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), registerPlayer);
router.get('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), getPlayerById);
router.put('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), updatePlayer);
router.delete('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), deletePlayer);

export default router;
