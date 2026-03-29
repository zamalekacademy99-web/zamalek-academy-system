import { Request, Response } from 'express';
import prisma from '../db';

export const getAdminNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const notifications = await prisma.parentRequest.findMany({
            where: {
                status: { in: ['NEW', 'IN_REVIEW'] }
            },
            include: {
                parent: {
                    include: { user: { select: { name: true } } }
                },
                player: {
                    include: { group: { select: { name: true } } }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.status(200).json({ status: 'success', data: notifications });
    } catch (error: any) {
        console.error('Error fetching admin notifications:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const updateRequestStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, admin_reply } = req.body;

        const updated = await prisma.parentRequest.update({
            where: { id: id as string },
            data: { status, admin_reply }
        });

        res.status(200).json({ status: 'success', data: updated });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
