import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import prisma from '../db';

export const getCoachById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const coach = await prisma.coach.findUnique({
            where: { id: id as string },
            include: {
                branch: true,
                groups: { include: { _count: { select: { players: true } } } },
                user: { select: { id: true, email: true, plain_password: true, password_hash: true, role: true, is_active: true, name: true } },
                players: { select: { id: true, first_name: true, last_name: true, status: true } },
                schedules: { include: { branch: true, group: true } }
            }
        });

        if (!coach) {
            res.status(404).json({ status: 'error', message: 'Coach not found' });
            return;
        }

        res.status(200).json({ status: 'success', data: coach });
    } catch (error) {
        console.error('Error fetching coach by id:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};


export const getAllCoaches = async (req: Request, res: Response): Promise<void> => {
    try {
        const { branch_id } = req.query;
        const filter = branch_id ? { branch_id: String(branch_id), is_active: true } : { is_active: true };

        const coaches = await prisma.coach.findMany({
            where: filter,
            include: {
                branch: true,
                groups: { select: { id: true, name: true, branch_id: true } }
            }
        });

        res.status(200).json({ status: 'success', data: coaches });
    } catch (error) {
        console.error('Error fetching coaches:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const createCoach = async (req: Request, res: Response): Promise<void> => {
    try {
        const { full_name, phone, branch_id } = req.body;
        if (!full_name || !phone || !branch_id) {
            res.status(400).json({ status: 'error', message: 'Missing required fields' });
            return;
        }

        const newCoach = await prisma.coach.create({
            data: { full_name, phone, branch_id }
        });

        res.status(201).json({ status: 'success', data: newCoach });
    } catch (error) {
        console.error('Error creating coach:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const updateCoach = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { full_name, phone, branch_id, is_active, permissions } = req.body;

        const updateData: any = { full_name, phone, branch_id, is_active };
        // Only update permissions if explicitly sent
        if (permissions !== undefined) {
            updateData.permissions = permissions;
        }

        const updatedCoach = await prisma.coach.update({
            where: { id: String(id) },
            data: updateData
        });

        res.status(200).json({ status: 'success', data: updatedCoach });
    } catch (error) {
        console.error('Error updating coach:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};


export const deleteCoach = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Soft delete
        const softDeletedCoach = await prisma.coach.update({
            where: { id: id as string },
            data: { is_active: false }
        });

        res.status(200).json({ status: 'success', message: 'Coach soft deleted successfully', data: softDeletedCoach });
    } catch (error) {
        console.error('Error deleting coach:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
export const createCoachAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const coach = await prisma.coach.findUnique({
            where: { id: String(id) },
            include: { user: true }
        });

        if (!coach) {
            res.status(404).json({ status: 'error', message: 'Coach not found' });
            return;
        }

        if (coach.user_id) {
            res.status(400).json({ status: 'error', message: 'Coach already has a user account' });
            return;
        }

        // Generate email: full_name.random@zamalek-academy.local
        const cleanName = coach.full_name.toLowerCase().replace(/\s+/g, '.');
        const shortId = Math.random().toString(36).substring(2, 5);
        const email = `${cleanName}.${shortId}@zamalek-academy.local`;
        const password = coach.phone; // Use phone as plain_password
        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                password_hash: passwordHash,
                plain_password: password,
                name: coach.full_name,
                role: 'COACH',
            }
        });

        const updatedCoach = await prisma.coach.update({
            where: { id: coach.id },
            data: { user_id: newUser.id },
            include: { user: true }
        });

        res.status(201).json({ status: 'success', message: 'Account created successfully', data: updatedCoach });
    } catch (error: any) {
        console.error('Error creating coach account:', error);
        res.status(500).json({ status: 'error', message: error.message || 'Internal server error' });
    }
};
