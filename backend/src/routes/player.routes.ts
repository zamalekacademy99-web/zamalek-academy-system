import { Router } from 'express';
import { getAllPlayers, getPlayerById, registerPlayer, updatePlayer, deletePlayer } from '../controllers/player.controller';
import { authenticate } from '../middlewares/auth.middleware';
import type { Request, Response } from 'express';

const router = Router();

// Diagnostic: test this path is reachable without auth
router.get('/test-me', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'players route is alive', route: 'GET /api/v1/players/test-me' });
});

router.get('/', authenticate, getAllPlayers);
router.post('/register', authenticate, registerPlayer);
router.get('/:id', authenticate, getPlayerById);
router.put('/:id', authenticate, updatePlayer);
router.delete('/:id', authenticate, deletePlayer);

export default router;
