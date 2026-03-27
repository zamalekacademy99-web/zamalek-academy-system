import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllBranches = async (req: Request, res: Response): Promise<void> => {
    try {
        const branches = await prisma.branch.findMany({
            where: { is_active: true }
        });
        res.status(200).json({ status: 'success', data: branches });
    } catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const createBranch = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, location } = req.body;
        if (!name) {
            res.status(400).json({ status: 'error', message: 'يرجى إدخال اسم الفرع على الأقل (Name is required)' });
            return;
        }

        const newBranch = await prisma.branch.create({
            data: { name, location }
        });

        res.status(201).json({ status: 'success', data: newBranch });
    } catch (error) {
        console.error('Error creating branch:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const updateBranch = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, location, is_active } = req.body;

        const updatedBranch = await prisma.branch.update({
            where: { id: id as string },
            data: { name, location, is_active }
        });

        res.status(200).json({ status: 'success', data: updatedBranch });
    } catch (error) {
        console.error('Error updating branch:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const deleteBranch = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Use soft delete by setting active to false
        const softDeletedBranch = await prisma.branch.update({
            where: { id: id as string },
            data: { is_active: false }
        });

        res.status(200).json({ status: 'success', message: 'Branch soft deleted successfully', data: softDeletedBranch });
    } catch (error) {
        console.error('Error deleting branch:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
