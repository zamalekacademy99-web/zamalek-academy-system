import { Router } from 'express';
import {
    getCoachDashboard,
    getGroupPlayers,
    submitAttendance,
    submitEvaluation,
    getPlayerForEval,
    getCoachProfile
} from '../controllers/coach-portal.controller';
import { Role } from '@prisma/client';

const router = Router();

// All coach-portal routes require authentication
router.use(authenticate);
router.use(authorize([Role.COACH, Role.SUPER_ADMIN, Role.ADMIN]));


router.get('/dashboard', getCoachDashboard);
router.get('/profile', getCoachProfile);

router.get('/group/:groupId/players', getGroupPlayers);
router.post('/attendance', submitAttendance);
router.post('/evaluate', submitEvaluation);
router.get('/players/:playerId', getPlayerForEval);

export default router;
