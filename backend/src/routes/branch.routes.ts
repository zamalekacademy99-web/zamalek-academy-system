import { Router } from 'express';
import { getAllBranches, createBranch, updateBranch, deleteBranch } from '../controllers/branch.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Only authenticated users can see branches (Admin/Management/Parents)
router.get('/', authenticate, getAllBranches);

// Only Super Admin can create branches
router.post('/', authenticate, authorize(['SUPER_ADMIN']), createBranch);
router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), updateBranch);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN']), deleteBranch);

export default router;
