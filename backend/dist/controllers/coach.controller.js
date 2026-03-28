"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoach = exports.updateCoach = exports.createCoach = exports.getAllCoaches = void 0;
const db_1 = __importDefault(require("../db"));
const getAllCoaches = async (req, res) => {
    try {
        const { branch_id } = req.query;
        const filter = branch_id ? { branch_id: String(branch_id), is_active: true } : { is_active: true };
        const coaches = await db_1.default.coach.findMany({
            where: filter,
            include: { branch: true }
        });
        res.status(200).json({ status: 'success', data: coaches });
    }
    catch (error) {
        console.error('Error fetching coaches:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getAllCoaches = getAllCoaches;
const createCoach = async (req, res) => {
    try {
        const { full_name, phone, branch_id } = req.body;
        if (!full_name || !phone || !branch_id) {
            res.status(400).json({ status: 'error', message: 'Missing required fields' });
            return;
        }
        const newCoach = await db_1.default.coach.create({
            data: { full_name, phone, branch_id }
        });
        res.status(201).json({ status: 'success', data: newCoach });
    }
    catch (error) {
        console.error('Error creating coach:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.createCoach = createCoach;
const updateCoach = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, phone, branch_id, is_active } = req.body;
        const updatedCoach = await db_1.default.coach.update({
            where: { id: id },
            data: { full_name, phone, branch_id, is_active }
        });
        res.status(200).json({ status: 'success', data: updatedCoach });
    }
    catch (error) {
        console.error('Error updating coach:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.updateCoach = updateCoach;
const deleteCoach = async (req, res) => {
    try {
        const { id } = req.params;
        // Soft delete
        const softDeletedCoach = await db_1.default.coach.update({
            where: { id: id },
            data: { is_active: false }
        });
        res.status(200).json({ status: 'success', message: 'Coach soft deleted successfully', data: softDeletedCoach });
    }
    catch (error) {
        console.error('Error deleting coach:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.deleteCoach = deleteCoach;
