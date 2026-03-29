import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/coach/dashboard
// Returns today's groups/schedules for the logged-in coach
export const getCoachDashboard = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const coach = await prisma.coach.findUnique({
            where: { user_id: userId },
            include: {
                groups: {
                    include: {
                        players: { select: { id: true, first_name: true, last_name: true, photo_url: true } },
                        schedules: { include: { branch: true } }
                    }
                },
                schedules: {
                    include: { branch: true, group: true }
                },
                branch: true
            }
        });

        if (!coach) return res.status(404).json({ success: false, message: 'Coach profile not found.' });

        const todayDow = new Date().getDay(); // 0-6

        const todaySchedules = coach.schedules.filter(s => s.day_of_week === todayDow);

        return res.json({
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
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
};

// GET /api/v1/coach/group/:groupId/players
// Returns player roster for a specific group (for attendance taking)
export const getGroupPlayers = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const players = await prisma.player.findMany({
            where: { group_id: groupId, status: 'ACTIVE' },
            include: {
                attendance: { orderBy: { date: 'desc' }, take: 5 }
            },
            orderBy: { first_name: 'asc' }
        });

        return res.json({ success: true, data: players });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/v1/coach/attendance
// Body: { schedule_id, date, records: [{player_id, status, notes}] }
export const submitAttendance = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { schedule_id, date, records } = req.body;

        const coach = await prisma.coach.findUnique({ where: { user_id: userId } });
        if (!coach) return res.status(404).json({ success: false, message: 'Coach not found.' });

        const dateObj = new Date(date);

        const upsertOps = records.map((r: any) =>
            prisma.attendance.upsert({
                where: { player_id_schedule_id_date: { player_id: r.player_id, schedule_id, date: dateObj } },
                create: {
                    player_id: r.player_id,
                    schedule_id,
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

        return res.json({ success: true, message: `Saved attendance for ${records.length} players.` });
    } catch (err: any) {
        console.error('Attendance Submit Error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/v1/coach/evaluate
// Body: { player_id, date, commitment_score, discipline_score, technical_score, fitness_score, notes }
export const submitEvaluation = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { player_id, date, commitment_score, discipline_score, technical_score, fitness_score, notes } = req.body;

        const coach = await prisma.coach.findUnique({ where: { user_id: userId } });
        if (!coach) return res.status(404).json({ success: false, message: 'Coach not found.' });

        const evaluation = await prisma.evaluation.create({
            data: {
                player_id,
                coach_id: coach.id,
                date: new Date(date),
                commitment_score: parseInt(commitment_score),
                discipline_score: parseInt(discipline_score),
                technical_score: parseInt(technical_score),
                fitness_score: parseInt(fitness_score),
                notes
            }
        });

        return res.status(201).json({ success: true, data: evaluation });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/v1/coach/players/:playerId
// Returns full player profile for evaluation context
export const getPlayerForEval = async (req: Request, res: Response) => {
    try {
        const { playerId } = req.params;
        const player = await prisma.player.findUnique({
            where: { id: playerId },
            include: {
                group: true,
                branch: true,
                evaluations: { orderBy: { date: 'desc' }, take: 10, include: { coach: { select: { full_name: true } } } },
                attendance: { orderBy: { date: 'desc' }, take: 10 }
            }
        });

        if (!player) return res.status(404).json({ success: false, message: 'Player not found.' });
        return res.json({ success: true, data: player });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
