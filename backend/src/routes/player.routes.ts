import { Router } from 'express';
import { getAllPlayers, registerPlayer, updatePlayer, deletePlayer } from '../controllers/player.controller';
import { authenticate } from '../middlewares/auth.middleware'; // Removed authorize to allow standard Admins

const router = Router();

router.get('/', authenticate, getAllPlayers); // Optional: add authorization layer
router.post('/register', authenticate, registerPlayer);
router.put('/:id', authenticate, updatePlayer);
router.delete('/:id', authenticate, deletePlayer);

export default router;
