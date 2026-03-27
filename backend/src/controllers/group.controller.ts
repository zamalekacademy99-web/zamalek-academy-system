import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllGroups = async (req: Request, res: Response): Promise<void> => {
    try {
        const { branch_id } = req.query;

        const filter = branch_id ? { branch_id: String(branch_id) } : {};

        const groups = await prisma.group.findMany({
            where: filter,
            include: { branch: true }
        });

        res.status(200).json({ status: 'success', data: groups });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const createGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, branch_id, age_category } = req.body;
        if (!name || !branch_id || !age_category) {
            res.status(400).json({ status: 'error', message: 'Missing required fields' });
            return;
        }

        const newGroup = await prisma.group.create({
            data: { name, branch_id, age_category }
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
        const { name, branch_id, age_category } = req.body;

        const updatedGroup = await prisma.group.update({
            where: { id: id as string },
            data: { name, branch_id, age_category }
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
