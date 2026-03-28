"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSentHistory = exports.sendNotification = void 0;
const db_1 = __importDefault(require("../db"));
const sendNotification = async (req, res) => {
    try {
        const { title, message, type, targetType, targetId } = req.body;
        if (!title || !message) {
            res.status(400).json({ status: 'error', message: 'Title and message are required' });
            return;
        }
        let userIds = [];
        if (targetType === 'ALL') {
            const users = await db_1.default.user.findMany({ where: { role: 'PARENT' }, select: { id: true } });
            userIds = users.map(u => u.id);
        }
        else if (targetType === 'BRANCH' && targetId) {
            const players = await db_1.default.player.findMany({
                where: { branch_id: targetId },
                include: { parent: true }
            });
            userIds = players.map(p => p.parent.user_id);
        }
        else if (targetType === 'GROUP' && targetId) {
            const players = await db_1.default.player.findMany({
                where: { group_id: targetId },
                include: { parent: true }
            });
            userIds = players.map(p => p.parent.user_id);
        }
        else if (targetType === 'USER' && targetId) {
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
            is_read: false
        }));
        const result = await db_1.default.notification.createMany({
            data: notificationData
        });
        res.status(201).json({
            status: 'success',
            data: {
                sent_count: result.count
            }
        });
    }
    catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ status: 'error', message: error.message || 'Internal server error' });
    }
};
exports.sendNotification = sendNotification;
const getSentHistory = async (req, res) => {
    try {
        // Fetch the most recent distinct notifications based on title and message
        const recentNotifications = await db_1.default.notification.findMany({
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
            }
            else {
                historyMap.get(key).count += 1;
            }
        });
        const history = Array.from(historyMap.values()).slice(0, 10);
        res.status(200).json({
            status: 'success',
            data: history
        });
    }
    catch (error) {
        console.error('Error fetching notification history:', error);
        res.status(500).json({ status: 'error', message: error.message || 'Internal server error' });
    }
};
exports.getSentHistory = getSentHistory;
