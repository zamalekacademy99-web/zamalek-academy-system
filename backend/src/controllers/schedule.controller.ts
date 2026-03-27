import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
        const { branch_id, group_id, coach_id, day_of_week, start_time, end_time, field_name } = req.body;

        if (!branch_id || !group_id || !coach_id || day_of_week === undefined || !start_time || !end_time) {
            res.status(400).json({ status: 'error', message: 'Missing required training schedule fields' });
            return;
        }

        const newSchedule = await prisma.schedule.create({
            data: {
                branch_id,
                group_id,
                coach_id,
                day_of_week: parseInt(day_of_week),
                start_time,
                end_time,
                field_name
            }
        });

        res.status(201).json({ status: 'success', data: newSchedule });
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
