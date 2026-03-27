import { Router } from 'express';
import { getAllGroups, createGroup, updateGroup, deleteGroup } from '../controllers/group.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getAllGroups);
router.post('/', authenticate, authorize(['SUPER_ADMIN']), createGroup);
router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), updateGroup);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN']), deleteGroup);

export default router;
