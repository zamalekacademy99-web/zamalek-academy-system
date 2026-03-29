import { Request, Response } from 'express';

import prisma from '../db';


export const getAllSchedules = async (req: Request, res: Response): Promise<void> => {
    try {
        const { branch_id, coach_id, group_id } = req.query;

        // Build dynamic filter
        const filter: any = {};
        if (branch_id) filter.branch_id = String(branch_id);
        if (coach_id) filter.coach_id = String(coach_id);
        if (group_id) filter.group_id = String(group_id);

        const schedules = await prisma.schedule.findMany({
            where: filter,
            include: {
                branch: true,
                group: true,
                coach: true
            },
            orderBy: [
                { day_of_week: 'asc' },
                { start_time: 'asc' }
            ]
        });

        res.status(200).json({ status: 'success', data: schedules });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const createSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const { branch_id, group_ids, day_of_week, start_time, end_time, field_name } = req.body;

        if (!branch_id || !group_ids || !Array.isArray(group_ids) || group_ids.length === 0 || day_of_week === undefined || !start_time || !end_time) {
            res.status(400).json({ status: 'error', message: 'Missing required fields or group_ids is not an array' });
            return;
        }

        console.log(`[Schedule v1.6.2] Bulk creating for groups: ${group_ids.join(', ')}`);

        const createdSchedules = await prisma.$transaction(async (tx) => {
            const results: any[] = [];
            for (const gid of group_ids) {
                // 1. Find the group and its linked coaches
                const group = await (tx.group as any).findUnique({
                    where: { id: String(gid) },
                    include: { coaches: true }
                });

                if (!group) continue;

                // 2. Auto-assign the first coach
                const coach_id = group.coaches?.[0]?.id;
                if (!coach_id) {
                    console.warn(`[Schedule v1.6.2] Group ${group.name} (${gid}) has no linked coaches. Skipping.`);
                    continue;
                }

                // 3. Create schedule record
                const sch = await tx.schedule.create({
                    data: {
                        branch_id,
                        group_id: gid,
                        coach_id,
                        day_of_week: parseInt(day_of_week),
                        start_time,
                        end_time,
                        field_name
                    }
                });
                results.push(sch);
            }
            return results;
        });

        res.status(201).json({
            status: 'success',
            message: `Successfully created ${createdSchedules.length} training sessions.`,
            data: createdSchedules
        });
    } catch (error: any) {
        console.error('Error creating schedules:', error);
        res.status(500).json({ status: 'error', message: error.message || 'Internal server error' });
    }
};
