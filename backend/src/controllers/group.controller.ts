import { Request, Response } from 'express';

import prisma from '../db';


export const getAllGroups = async (req: Request, res: Response): Promise<void> => {
    try {
        const { branch_id, coach_id } = req.query;

        const filter: any = {};
        if (branch_id) filter.branch_id = String(branch_id);
        if (coach_id) {
            filter.coaches = { some: { id: String(coach_id) } };
        }

        const groups = await prisma.group.findMany({
            where: filter,
            include: {
                branch: true,
                coaches: true,
                _count: { select: { players: true } }
            }
        });

        res.status(200).json({ status: 'success', data: groups });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const createGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, branch_id, age_category, is_active, notes, coach_ids } = req.body;
        if (!name || !branch_id || !age_category) {
            res.status(400).json({ status: 'error', message: 'Missing required fields' });
            return;
        }

        const newGroup = await prisma.group.create({
            data: {
                name,
                branch_id,
                age_category,
                is_active: is_active ?? true,
                notes: notes || null,
                coaches: coach_ids && coach_ids.length > 0 ? {
                    connect: coach_ids.map((id: string) => ({ id }))
                } : undefined
            },
            include: { coaches: true }
        });

        res.status(201).json({ status: 'success', data: newGroup });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const updateGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, branch_id, age_category, is_active, notes, coach_ids } = req.body;

        const updatedGroup = await prisma.group.update({
            where: { id: id as string },
            data: {
                name,
                branch_id,
                age_category,
                is_active,
                notes,
                coaches: coach_ids ? {
                    set: coach_ids.map((id: string) => ({ id }))
                } : undefined
            },
            include: { coaches: true }
        });

        res.status(200).json({ status: 'success', data: updatedGroup });
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        await prisma.group.delete({
            where: { id: id as string }
        });

        res.status(200).json({ status: 'success', message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
