import { Request, Response } from 'express';
import { PrismaClient, RequestType } from '@prisma/client';

import prisma from '../db';


// 1. Dashboard Overview
export const getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const parentId = (req as any).user.parentId;
        if (!parentId) { res.status(403).json({ status: 'error', message: 'Parent profile not found in session' }); return; }

        const players = await prisma.player.findMany({
            where: { parent_id: parentId },
            include: {
                branch: true,
                group: {
                    include: {
                        schedules: { include: { branch: true, coach: true, group: true } }
                    }
                },
                coach: true,
                attendance: { orderBy: { date: 'desc' }, take: 5 },
                payments: { orderBy: { date: 'desc' }, take: 1 },
                evaluations: {
                    orderBy: { date: 'desc' },
                    take: 3,
                    include: { coach: { select: { full_name: true } } }
                }
            }
        });


        const unreadNotifications = await prisma.notification.count({
            where: { user_id: (req as any).user.id, is_read: false }
        });

        // Determine alerts (overdue payments, recent absences)
        const alerts: any[] = [];
        players.forEach(p => {
            const absences = p.attendance.filter(a => a.status === 'ABSENT_UNEXCUSED');
            if (absences.length > 0) alerts.push({ type: 'ABSENCE', message: `غياب بدون عذر مسجل للاعب ${p.first_name}` });
            // simplified payment check
            if (p.status !== 'ACTIVE') alerts.push({ type: 'STATUS', message: `حساب ${p.first_name} غير نشط` });
        });

        res.status(200).json({ status: 'success', data: { parent_id: parentId, children: players, alerts, unread_notifications: unreadNotifications } });
    } catch (error) {
        console.error('Error fetching parent dashboard:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// 2. My Children List
export const getChildren = async (req: Request, res: Response): Promise<void> => {
    try {
        const parentId = (req as any).user.parentId;
        if (!parentId) { res.status(403).json({ status: 'error', message: 'Parent profile not found in session' }); return; }

        const children = await prisma.player.findMany({
            where: { parent_id: parentId },
            include: {
                branch: true,
                group: {
                    include: {
                        schedules: { include: { branch: true, coach: true, group: true } }
                    }
                },
                coach: true,
                evaluations: { orderBy: { date: 'desc' }, take: 1 }
            }
        });

        res.status(200).json({ status: 'success', data: children });
    } catch (error) {
        console.error('Error fetching children:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// 3. Child Specific Data (Attendance, Payments, Evaluations)
export const getChildAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
        const { childId } = req.params;
        const parentId = (req as any).user.parentId;
        if (!parentId) { res.status(403).json({ status: 'error', message: 'Unauthorized' }); return; }

        // Security check: ensure child belongs to parent
        const child = await prisma.player.findFirst({ where: { id: childId as string, parent_id: parentId as string } });
        if (!child) { res.status(404).json({ status: 'error', message: 'Child not found or unauthorized' }); return; }

        const attendance = await prisma.attendance.findMany({
            where: { player_id: childId as string },
            orderBy: { date: 'desc' }
        });

        res.status(200).json({ status: 'success', data: attendance });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const getChildPayments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { childId } = req.params;
        const parentId = (req as any).user.parentId;
        if (!parentId) { res.status(403).json({ status: 'error', message: 'Unauthorized' }); return; }

        const child = await prisma.player.findFirst({ where: { id: childId as string, parent_id: parentId as string } });
        if (!child) { res.status(404).json({ status: 'error', message: 'Child not found or unauthorized' }); return; }

        const payments = await prisma.payment.findMany({
            where: { player_id: childId as string },
            orderBy: { date: 'desc' }
        });

        res.status(200).json({ status: 'success', data: payments });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const getChildEvaluations = async (req: Request, res: Response): Promise<void> => {
    try {
        const { childId } = req.params;
        const parentId = (req as any).user.parentId;
        if (!parentId) { res.status(403).json({ status: 'error', message: 'Unauthorized' }); return; }

        const child = await prisma.player.findFirst({ where: { id: childId as string, parent_id: parentId as string } });
        if (!child) { res.status(404).json({ status: 'error', message: 'Child not found or unauthorized' }); return; }

        const evaluations = await prisma.evaluation.findMany({
            where: { player_id: childId as string },
            include: { coach: true },
            orderBy: { date: 'desc' }
        });

        res.status(200).json({ status: 'success', data: evaluations });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// 4. Notifications
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { user_id: (req as any).user.id },
            orderBy: { created_at: 'desc' }
        });
        res.status(200).json({ status: 'success', data: notifications });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// 5. Submit Request
export const submitRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const parentId = (req as any).user.parentId;
        if (!parentId) { res.status(403).json({ status: 'error', message: 'Parent profile not found' }); return; }

        const { type, message, child_id } = req.body;
        if (!type || !message) {
            res.status(400).json({ status: 'error', message: 'Type and message are required' });
            return;
        }

        if (child_id) {
            const child = await prisma.player.findFirst({ where: { id: child_id, parent_id: parentId } });
            if (!child) { res.status(404).json({ status: 'error', message: 'Child not found' }); return; }
        }

        const newReq = await prisma.parentRequest.create({
            data: {
                parent_id: parentId,
                player_id: child_id || null,
                type: type as RequestType,
                message
            }
        });

        res.status(201).json({ status: 'success', data: newReq });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
