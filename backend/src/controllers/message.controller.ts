import { Request, Response } from 'express';
import prisma from '../db';

// Use prisma as any to allow new models (parentMessage) that exist in schema
// but may not be reflected in local client types until db push runs in Railway
const db = prisma as any;

// POST /api/v1/messages  — Admin/Coach sends a message to a parent
export const sendMessageToParent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { parent_id, player_id, message } = req.body;
        if (!parent_id || !message) {
            res.status(400).json({ success: false, message: 'Missing parent_id or message' });
            return;
        }

        const msg = await db.parentMessage.create({
            data: {
                parent_id: String(parent_id),
                player_id: player_id ? String(player_id) : null,
                message: String(message)
            }
        });

        res.status(201).json({ success: true, data: msg });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/v1/messages/parent/:parentId
export const getMessagesForParent = async (req: Request, res: Response): Promise<void> => {
    try {
        const parentId = String(req.params.parentId);
        const messages = await db.parentMessage.findMany({
            where: { parent_id: parentId },
            orderBy: { created_at: 'desc' },
            include: { player: { select: { first_name: true, last_name: true } } }
        });
        res.json({ success: true, data: messages });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/v1/messages/:id/read
export const markMessageRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = String(req.params.id);
        await db.parentMessage.update({ where: { id }, data: { is_read: true } });
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};
