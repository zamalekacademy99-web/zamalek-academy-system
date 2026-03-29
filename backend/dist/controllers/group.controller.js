"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGroup = exports.updateGroup = exports.createGroup = exports.getAllGroups = void 0;
const db_1 = __importDefault(require("../db"));
const getAllGroups = async (req, res) => {
    try {
        const { branch_id } = req.query;
        const filter = branch_id ? { branch_id: String(branch_id) } : {};
        const groups = await db_1.default.group.findMany({
            where: filter,
            include: {
                branch: true,
                coaches: true,
                _count: { select: { players: true } }
            }
        });
        res.status(200).json({ status: 'success', data: groups });
    }
    catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getAllGroups = getAllGroups;
const createGroup = async (req, res) => {
    try {
        const { name, branch_id, age_category, is_active, notes, coach_ids } = req.body;
        if (!name || !branch_id || !age_category) {
            res.status(400).json({ status: 'error', message: 'Missing required fields' });
            return;
        }
        const newGroup = await db_1.default.group.create({
            data: {
                name,
                branch_id,
                age_category,
                is_active: is_active ?? true,
                notes: notes || null,
                coaches: coach_ids && coach_ids.length > 0 ? {
                    connect: coach_ids.map((id) => ({ id }))
                } : undefined
            },
            include: { coaches: true }
        });
        res.status(201).json({ status: 'success', data: newGroup });
    }
    catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.createGroup = createGroup;
const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, branch_id, age_category, is_active, notes, coach_ids } = req.body;
        const updatedGroup = await db_1.default.group.update({
            where: { id: id },
            data: {
                name,
                branch_id,
                age_category,
                is_active,
                notes,
                coaches: coach_ids ? {
                    set: coach_ids.map((id) => ({ id }))
                } : undefined
            },
            include: { coaches: true }
        });
        res.status(200).json({ status: 'success', data: updatedGroup });
    }
    catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.updateGroup = updateGroup;
const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.default.group.delete({
            where: { id: id }
        });
        res.status(200).json({ status: 'success', message: 'Group deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.deleteGroup = deleteGroup;
