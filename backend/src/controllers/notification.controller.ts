import { Role, NotificationType } from '@prisma/client';
import prisma from '../db';
import { Request, Response } from 'express';


export const sendNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, message, type, targetType, targetId, priority } = req.body;

        if (!title || !message) {
            res.status(400).json({ status: 'error', message: 'Title and message are required' });
            return;
        }

        let userIds: string[] = [];

        if (targetType === 'ALL') {
            const users = await prisma.user.findMany({ where: { role: 'PARENT' as Role }, select: { id: true } });
            userIds = users.map(u => u.id);
        } else if (targetType === 'COACHES') {
            const users = await prisma.user.findMany({ where: { role: 'COACH' as Role }, select: { id: true } });
            userIds = users.map(u => u.id);
        } else if (targetType === 'BRANCH' && targetId) {
            const players = await prisma.player.findMany({
                where: { branch_id: targetId },
                include: { parent: true }
            });
            userIds = players.map(p => p.parent.user_id);
        } else if (targetType === 'GROUP' && targetId) {
            const players = await prisma.player.findMany({
                where: { group_id: targetId },
                include: { parent: true }
            });
            userIds = players.map(p => p.parent.user_id);
        } else if (targetType === 'USER' && targetId) {
            userIds = [targetId];
        }

        // Deduplicate user ids
        userIds = Array.from(new Set(userIds));

        if (userIds.length === 0) {
            res.status(404).json({ status: 'error', message: 'No users found for the selected target' });
            return;
        }

        const notificationData = userIds.map(userId => ({
            user_id: userId,
            title,
            message,
            type: type || 'ALERT',
            priority: priority || 'NORMAL',
            is_read: false
        }));

        const result = await prisma.notification.createMany({
            data: notificationData
        });

        res.status(201).json({
            status: 'success',
            data: {
                sent_count: result.count
            }
        });
    } catch (error: any) {
        console.error('Error sending notification:', error);
        res.status(500).json({ status: 'error', message: error.message || 'Internal server error' });
    }
};

export const getSentHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch the most recent distinct notifications based on title and message
        const recentNotifications = await prisma.notification.findMany({
            orderBy: { created_at: 'desc' },
            take: 100
        });

        // Group by title/message to show "sent batches" instead of individual rows
        const historyMap = new Map();
        recentNotifications.forEach(n => {
            const key = `${n.title}-${n.message}`;
            if (!historyMap.has(key)) {
                historyMap.set(key, {
                    title: n.title,
                    message: n.message,
                    type: n.type,
                    created_at: n.created_at,
                    count: 1
                });
            } else {
                historyMap.get(key).count += 1;
            }
        });

        const history = Array.from(historyMap.values()).slice(0, 10);

        res.status(200).json({
            status: 'success',
            data: history
        });
    } catch (error: any) {
        console.error('Error fetching notification history:', error);
        res.status(500).json({ status: 'error', message: error.message || 'Internal server error' });
    }
};

export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.notification.update({
            where: { id: id as string },
            data: { is_read: true }
        });
        res.status(200).json({ status: 'success' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const markAllNotificationsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        if (!user) {
            res.status(401).json({ status: 'error', message: 'Unauthorized' });
            return;
        }

        await prisma.notification.updateMany({
            where: { user_id: user.id, is_read: false },
            data: { is_read: true }
        });

        res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message || 'Internal server error' });
    }
};

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        if (!user) {
            res.status(401).json({ status: 'error', message: 'Unauthorized' });
            return;
        }

        const notifications = await prisma.notification.findMany({
            where: { user_id: user.id },
            orderBy: { created_at: 'desc' },
            take: 50
        });

        res.status(200).json({ status: 'success', data: notifications });
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ status: 'error', message: error.message || 'Internal server error' });
    }
};
