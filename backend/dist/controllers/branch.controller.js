"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBranch = exports.updateBranch = exports.createBranch = exports.getAllBranches = void 0;
const db_1 = __importDefault(require("../db"));
const getAllBranches = async (req, res) => {
    try {
        const branches = await db_1.default.branch.findMany({
            where: { is_active: true }
        });
        res.status(200).json({ status: 'success', data: branches });
    }
    catch (error) {
        console.error('Error fetching branches:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getAllBranches = getAllBranches;
const createBranch = async (req, res) => {
    try {
        const { name, location } = req.body;
        if (!name) {
            res.status(400).json({ status: 'error', message: 'يرجى إدخال اسم الفرع على الأقل (Name is required)' });
            return;
        }
        const newBranch = await db_1.default.branch.create({
            data: { name, location }
        });
        res.status(201).json({ status: 'success', data: newBranch });
    }
    catch (error) {
        console.error('Error creating branch:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.createBranch = createBranch;
const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, is_active } = req.body;
        const updatedBranch = await db_1.default.branch.update({
            where: { id: id },
            data: { name, location, is_active }
        });
        res.status(200).json({ status: 'success', data: updatedBranch });
    }
    catch (error) {
        console.error('Error updating branch:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.updateBranch = updateBranch;
const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        // Use soft delete by setting active to false
        const softDeletedBranch = await db_1.default.branch.update({
            where: { id: id },
            data: { is_active: false }
        });
        res.status(200).json({ status: 'success', message: 'Branch soft deleted successfully', data: softDeletedBranch });
    }
    catch (error) {
        console.error('Error deleting branch:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.deleteBranch = deleteBranch;
