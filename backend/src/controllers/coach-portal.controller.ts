import { Request, Response } from 'express';
import prisma from '../db'; // use shared instance, not new PrismaClient()

// GET /api/v1/coach/dashboard
export const getCoachDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        let userId = (req as any).user?.id;
        const role = (req as any).user?.role;
        const impersonateId = req.query.coachId as string;

        let coach;
        if (impersonateId && (role === 'ADMIN' || role === 'SUPER_ADMIN')) {
            // Admin is viewing a specific coach portal
            coach = await (prisma as any).coach.findUnique({
                where: { id: impersonateId },
                include: {
                    groups: {
                        include: {
                            players: { select: { id: true, first_name: true, last_name: true } },
                            schedules: { include: { branch: true } }
                        }
                    },
                    schedules: { include: { branch: true, group: true } },
                    branch: true
                }
            });
        } else {
            // Regular coach view
            if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
            coach = await (prisma as any).coach.findUnique({
                where: { user_id: userId },
                include: {
                    groups: {
                        include: {
                            players: { select: { id: true, first_name: true, last_name: true } },
                            schedules: { include: { branch: true } }
                        }
                    },
                    schedules: { include: { branch: true, group: true } },
                    branch: true
                }
            });
        }

        if (!coach) { res.status(404).json({ success: false, message: 'Coach profile not found.' }); return; }

        const todayDow = new Date().getDay();
        const todaySchedules = coach.schedules.filter((s: any) => s.day_of_week === todayDow);

        res.json({
            success: true,
            data: {
                coach: {
                    id: coach.id,
                    full_name: coach.full_name,
                    branch: coach.branch?.name,
                    groups: coach.groups,
                    todaySchedules
                }
            }
        });
    } catch (err: any) {
        console.error('Coach Dashboard Error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// GET /api/v1/coach/group/:groupId/players
export const getGroupPlayers = async (req: Request, res: Response): Promise<void> => {
    try {
        const groupId = String(req.params.groupId);
        const players = await prisma.player.findMany({
            where: { group_id: groupId, status: 'ACTIVE' },
            include: { attendance: { orderBy: { date: 'desc' }, take: 5 } },
            orderBy: { first_name: 'asc' }
        });
        res.json({ success: true, data: players });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/v1/coach/attendance
export const submitAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const role = (req as any).user?.role;
        const { schedule_id, date, records, coach_id } = req.body;

        let coach;
        if (coach_id && (role === 'ADMIN' || role === 'SUPER_ADMIN')) {
            coach = await (prisma as any).coach.findUnique({ where: { id: String(coach_id) } });
        } else {
            coach = await (prisma as any).coach.findUnique({ where: { user_id: String(userId) } });
        }

        if (!coach) { res.status(404).json({ success: false, message: 'Coach not found.' }); return; }

        const dateObj = new Date(date);

        const upsertOps = (records as any[]).map((r: any) =>
            prisma.attendance.upsert({
                where: { player_id_schedule_id_date: { player_id: String(r.player_id), schedule_id: String(schedule_id), date: dateObj } },
                create: {
                    player_id: String(r.player_id),
                    schedule_id: String(schedule_id),
                    coach_id: coach.id,
                    date: dateObj,
                    status: r.status,
                    notes: r.notes || null
                },
                update: {
                    status: r.status,
                    coach_id: coach.id,
                    notes: r.notes || null
                }
            })
        );

        await prisma.$transaction(upsertOps);
        res.json({ success: true, message: `Saved attendance for ${records.length} players.` });
    } catch (err: any) {
        console.error('Attendance Submit Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/v1/coach/evaluate
export const submitEvaluation = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const role = (req as any).user?.role;
        const { player_id, date, commitment_score, discipline_score, technical_score, fitness_score, notes, coach_id } = req.body;

        let coach;
        if (coach_id && (role === 'ADMIN' || role === 'SUPER_ADMIN')) {
            coach = await (prisma as any).coach.findUnique({ where: { id: String(coach_id) } });
        } else {
            coach = await (prisma as any).coach.findUnique({ where: { user_id: String(userId) } });
        }

        if (!coach) { res.status(404).json({ success: false, message: 'Coach not found.' }); return; }

        const evaluation = await prisma.evaluation.create({
            data: {
                player_id: String(player_id),
                coach_id: coach.id,
                date: new Date(date),
                commitment_score: parseInt(String(commitment_score)),
                discipline_score: parseInt(String(discipline_score)),
                technical_score: parseInt(String(technical_score)),
                fitness_score: parseInt(String(fitness_score)),
                notes: notes || null
            }
        });

        res.status(201).json({ success: true, data: evaluation });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/v1/coach/players/:playerId
export const getPlayerForEval = async (req: Request, res: Response): Promise<void> => {
    try {
        const playerId = String(req.params.playerId);
        const player = await (prisma as any).player.findUnique({
            where: { id: playerId },
            include: {
                group: true,
                branch: true,
                evaluations: {
                    orderBy: { date: 'desc' },
                    take: 10,
                    include: { coach: { select: { full_name: true } } }
                },
                attendance: { orderBy: { date: 'desc' }, take: 10 }
            }
        });

        if (!player) { res.status(404).json({ success: false, message: 'Player not found.' }); return; }
        res.json({ success: true, data: player });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};
