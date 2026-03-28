"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitRequest = exports.getNotifications = exports.getChildEvaluations = exports.getChildPayments = exports.getChildAttendance = exports.getChildren = exports.getDashboard = void 0;
const db_1 = __importDefault(require("../db"));
// Helper to get parent_id from authenticated user
const getParentId = async (userId) => {
    const parent = await db_1.default.parent.findUnique({ where: { user_id: userId } });
    return parent ? parent.id : null;
};
// 1. Dashboard Overview
const getDashboard = async (req, res) => {
    try {
        const parentId = await getParentId(req.user.id);
        if (!parentId) {
            res.status(403).json({ status: 'error', message: 'Parent profile not found' });
            return;
        }
        const players = await db_1.default.player.findMany({
            where: { parent_id: parentId },
            include: {
                branch: true,
                group: true,
                coach: true,
                attendance: { orderBy: { date: 'desc' }, take: 5 },
                payments: { orderBy: { date: 'desc' }, take: 1 }
            }
        });
        const unreadNotifications = await db_1.default.notification.count({
            where: { user_id: req.user.id, is_read: false }
        });
        // Determine alerts (overdue payments, recent absences)
        const alerts = [];
        players.forEach(p => {
            const absences = p.attendance.filter(a => a.status === 'ABSENT_UNEXCUSED');
            if (absences.length > 0)
                alerts.push({ type: 'ABSENCE', message: `غياب بدون عذر مسجل للاعب ${p.first_name}` });
            // simplified payment check
            if (p.status !== 'ACTIVE')
                alerts.push({ type: 'STATUS', message: `حساب ${p.first_name} غير نشط` });
        });
        res.status(200).json({ status: 'success', data: { children: players, alerts, unread_notifications: unreadNotifications } });
    }
    catch (error) {
        console.error('Error fetching parent dashboard:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getDashboard = getDashboard;
// 2. My Children List
const getChildren = async (req, res) => {
    try {
        const parentId = await getParentId(req.user.id);
        if (!parentId) {
            res.status(403).json({ status: 'error', message: 'Parent profile not found' });
            return;
        }
        const children = await db_1.default.player.findMany({
            where: { parent_id: parentId },
            include: {
                branch: true, group: true, coach: true,
                schedules: { include: { schedule: { include: { coach: true, branch: true } } } } // if mapped via intermediate, here implies attendance logic or direct schedule link. 
                // Note: players are linked directly to branch, group, coach so we can infer Schedule from those.
            }
        });
        res.status(200).json({ status: 'success', data: children });
    }
    catch (error) {
        console.error('Error fetching children:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getChildren = getChildren;
// 3. Child Specific Data (Attendance, Payments, Evaluations)
const getChildAttendance = async (req, res) => {
    try {
        const { childId } = req.params;
        const parentId = await getParentId(req.user.id);
        // Security check: ensure child belongs to parent
        const child = await db_1.default.player.findFirst({ where: { id: childId, parent_id: parentId } });
        if (!child) {
            res.status(404).json({ status: 'error', message: 'Child not found or unauthorized' });
            return;
        }
        const attendance = await db_1.default.attendance.findMany({
            where: { player_id: childId },
            orderBy: { date: 'desc' }
        });
        res.status(200).json({ status: 'success', data: attendance });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getChildAttendance = getChildAttendance;
const getChildPayments = async (req, res) => {
    try {
        const { childId } = req.params;
        const parentId = await getParentId(req.user.id);
        const child = await db_1.default.player.findFirst({ where: { id: childId, parent_id: parentId } });
        if (!child) {
            res.status(404).json({ status: 'error', message: 'Child not found or unauthorized' });
            return;
        }
        const payments = await db_1.default.payment.findMany({
            where: { player_id: childId },
            orderBy: { date: 'desc' }
        });
        res.status(200).json({ status: 'success', data: payments });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getChildPayments = getChildPayments;
const getChildEvaluations = async (req, res) => {
    try {
        const { childId } = req.params;
        const parentId = await getParentId(req.user.id);
        const child = await db_1.default.player.findFirst({ where: { id: childId, parent_id: parentId } });
        if (!child) {
            res.status(404).json({ status: 'error', message: 'Child not found or unauthorized' });
            return;
        }
        const evaluations = await db_1.default.evaluation.findMany({
            where: { player_id: childId },
            include: { coach: true },
            orderBy: { date: 'desc' }
        });
        res.status(200).json({ status: 'success', data: evaluations });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getChildEvaluations = getChildEvaluations;
// 4. Notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await db_1.default.notification.findMany({
            where: { user_id: req.user.id },
            orderBy: { created_at: 'desc' }
        });
        res.status(200).json({ status: 'success', data: notifications });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getNotifications = getNotifications;
// 5. Submit Request
const submitRequest = async (req, res) => {
    try {
        const parentId = await getParentId(req.user.id);
        if (!parentId) {
            res.status(403).json({ status: 'error', message: 'Parent profile not found' });
            return;
        }
        const { type, message, child_id } = req.body;
        if (!type || !message) {
            res.status(400).json({ status: 'error', message: 'Type and message are required' });
            return;
        }
        if (child_id) {
            const child = await db_1.default.player.findFirst({ where: { id: child_id, parent_id: parentId } });
            if (!child) {
                res.status(404).json({ status: 'error', message: 'Child not found' });
                return;
            }
        }
        const newReq = await db_1.default.parentRequest.create({
            data: {
                parent_id: parentId,
                player_id: child_id || null,
                type: type,
                message
            }
        });
        res.status(201).json({ status: 'success', data: newReq });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.submitRequest = submitRequest;
