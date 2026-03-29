import { Request, Response } from 'express';
import prisma from '../db';

// POST /api/v1/messages  — Admin sends a message to a parent
export const sendMessageToParent = async (req: Request, res: Response) => {
    try {
        const { parent_id, player_id, message } = req.body;
        if (!parent_id || !message) return res.status(400).json({ success: false, message: 'Missing parent_id or message' });

        const msg = await prisma.parentMessage.create({
            data: { parent_id, player_id: player_id || null, message }
        });

        return res.status(201).json({ success: true, data: msg });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/v1/messages/parent/:parentId
export const getMessagesForParent = async (req: Request, res: Response) => {
    try {
        const { parentId } = req.params;
        const messages = await prisma.parentMessage.findMany({
            where: { parent_id: parentId },
            orderBy: { created_at: 'desc' },
            include: { player: { select: { first_name: true, last_name: true } } }
        });
        return res.json({ success: true, data: messages });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/v1/messages/:id/read
export const markMessageRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.parentMessage.update({ where: { id }, data: { is_read: true } });
        return res.json({ success: true });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
