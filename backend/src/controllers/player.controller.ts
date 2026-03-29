import { Request, Response } from 'express';
import { PrismaClient, Role, PlayerStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcrypt';

import prisma from '../db';


export const registerPlayer = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            player_first_name, player_last_name, dob,
            branch_id, group_id, coach_id,
            parent_name, parent_phone, parent_email,
            payment_amount, payment_method, reference_no
        } = req.body;

        if (!player_first_name || !branch_id || !parent_phone || !payment_amount || !payment_method) {
            res.status(400).json({ status: 'error', message: 'Missing required fields' });
            return;
        }

        // Step 1: Handle Parent (Find or Create)
        let parent = await prisma.parent.findFirst({
            where: {
                OR: [
                    { phone: parent_phone },
                    parent_email ? { user: { email: parent_email } } : {}
                ].filter(condition => Object.keys(condition).length > 0)
            },
            include: { user: true }
        });

        const isNewParent = !parent;

        if (!parent) {
            // Create new User and Parent profile
            const defaultPassword = await bcrypt.hash(parent_phone, 10); // temporary password = phone
            const emailToUse = parent_email || `${parent_phone}@zamalek-academy.local`;

            const newUser = await prisma.user.create({
                data: {
                    name: parent_name || 'Parent User',
                    email: emailToUse,
                    password_hash: defaultPassword,
                    plain_password: parent_phone, // store plain text for admin reference
                    role: Role.PARENT
                }
            });

            parent = await prisma.parent.create({
                data: {
                    user_id: newUser.id,
                    phone: parent_phone
                },
                include: { user: true }
            });
        }

        // Step 2: Create Player
        const newPlayer = await prisma.player.create({
            data: {
                first_name: player_first_name,
                last_name: player_last_name || '',
                dob: new Date(dob || new Date()),
                parent_id: parent.id,
                branch_id,
                group_id,
                coach_id,
                status: PlayerStatus.ACTIVE,
                subscription_start_date: new Date()
            }
        });

        // Step 3: Record Initial Payment
        const adminId = (req as any).user.id; // From auth middleware
        await prisma.payment.create({
            data: {
                player_id: newPlayer.id,
                amount: parseFloat(payment_amount),
                method: payment_method as PaymentMethod,
                reference_no,
                date: new Date(),
                recorded_by: adminId,
                notes: 'Initial Registration Payment'
            }
        });

        res.status(201).json({
            status: 'success',
            message: isNewParent
                ? 'Player registered successfully. New parent account created.'
                : 'Player registered successfully. Child was linked to the existing parent account.',
            data: { player_id: newPlayer.id, parent_id: parent.id, is_new_parent: isNewParent }
        });

    } catch (error) {
        console.error('Error during player registration:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const getAllPlayers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { branch_id, coach_id } = req.query;
        const filter: any = {};
        if (branch_id) filter.branch_id = String(branch_id);
        if (coach_id) {
            const coach = await prisma.coach.findUnique({
                where: { id: String(coach_id) },
                include: { groups: true }
            });
            const groupIds = coach?.groups.map(g => g.id) || [];
            filter.OR = [
                { coach_id: String(coach_id) },
                { group_id: { in: groupIds } }
            ];
        }

        const players = await prisma.player.findMany({
            where: filter,
            include: {
                parent: { include: { user: true } },
                branch: true,
                group: true,
                coach: true,
            }
        });

        res.status(200).json({ status: 'success', data: players });
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const getPlayerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const player = await prisma.player.findUnique({
            where: { id: id as string },
            include: {
                parent: { include: { user: true } },
                branch: true,
                group: { include: { schedules: true } },
                coach: true,
                attendance: { orderBy: { date: 'desc' }, take: 30 },
                evaluations: {
                    orderBy: { date: 'desc' },
                    take: 10,
                    include: { coach: { select: { full_name: true } } }
                }
            }
        });

        if (!player) {
            res.status(404).json({ status: 'error', message: 'Player not found' });
            return;
        }

        res.status(200).json({ status: 'success', data: player });
    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const updatePlayer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { first_name, last_name, branch_id, group_id, coach_id, status } = req.body;

        const updatedPlayer = await prisma.player.update({
            where: { id: id as string },
            data: { first_name, last_name, branch_id, group_id, coach_id, status }
        });

        res.status(200).json({ status: 'success', data: updatedPlayer });
    } catch (error) {
        console.error('Error updating player:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const deletePlayer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        await prisma.player.delete({
            where: { id: id as string }
        });

        res.status(200).json({ status: 'success', message: 'Player deleted successfully' });
    } catch (error) {
        console.error('Error deleting player:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
