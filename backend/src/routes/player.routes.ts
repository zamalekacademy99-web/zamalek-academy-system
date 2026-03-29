import { Router } from 'express';
import { getAllPlayers, getPlayerById, registerPlayer, updatePlayer, deletePlayer } from '../controllers/player.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getAllPlayers);
router.get('/:id', authenticate, getPlayerById);
router.post('/register', authenticate, registerPlayer);
router.put('/:id', authenticate, updatePlayer);
router.delete('/:id', authenticate, deletePlayer);

export default router;
