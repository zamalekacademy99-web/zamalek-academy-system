"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlayer = exports.updatePlayer = exports.getAllPlayers = exports.registerPlayer = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../db"));
const registerPlayer = async (req, res) => {
    try {
        const { player_first_name, player_last_name, dob, branch_id, group_id, coach_id, parent_name, parent_phone, parent_email, payment_amount, payment_method, reference_no } = req.body;
        if (!player_first_name || !branch_id || !parent_phone || !payment_amount || !payment_method) {
            res.status(400).json({ status: 'error', message: 'Missing required fields' });
            return;
        }
        // Step 1: Handle Parent (Find or Create)
        let parent = await db_1.default.parent.findFirst({
            where: {
                OR: [
                    { phone: parent_phone },
                    parent_email ? { user: { email: parent_email } } : {}
                ].filter(condition => Object.keys(condition).length > 0)
            },
            include: { user: true }
        });
        const isNewParent = !parent;
        if (!parent) {
            // Create new User and Parent profile
            const defaultPassword = await bcrypt_1.default.hash(parent_phone, 10); // temporary password = phone
            const emailToUse = parent_email || `${parent_phone}@zamalek-academy.local`;
            const newUser = await db_1.default.user.create({
                data: {
                    name: parent_name || 'Parent User',
                    email: emailToUse,
                    password_hash: defaultPassword,
                    role: client_1.Role.PARENT
                }
            });
            parent = await db_1.default.parent.create({
                data: {
                    user_id: newUser.id,
                    phone: parent_phone
                },
                include: { user: true }
            });
        }
        // Step 2: Create Player
        const newPlayer = await db_1.default.player.create({
            data: {
                first_name: player_first_name,
                last_name: player_last_name || '',
                dob: new Date(dob || new Date()),
                parent_id: parent.id,
                branch_id,
                group_id,
                coach_id,
                status: client_1.PlayerStatus.ACTIVE,
                subscription_start_date: new Date()
            }
        });
        // Step 3: Record Initial Payment
        const adminId = req.user.id; // From auth middleware
        await db_1.default.payment.create({
            data: {
                player_id: newPlayer.id,
                amount: parseFloat(payment_amount),
                method: payment_method,
                reference_no,
                date: new Date(),
                recorded_by: adminId,
                notes: 'Initial Registration Payment'
            }
        });
        res.status(201).json({
            status: 'success',
            message: 'Player registered successfully',
            data: { player_id: newPlayer.id, parent_id: parent.id }
        });
    }
    catch (error) {
        console.error('Error during player registration:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.registerPlayer = registerPlayer;
const getAllPlayers = async (req, res) => {
    try {
        const { branch_id } = req.query;
        const filter = branch_id ? { branch_id: String(branch_id) } : {};
        const players = await db_1.default.player.findMany({
            where: filter,
            include: {
                parent: { include: { user: true } },
                branch: true,
                group: true,
                coach: true,
            }
        });
        res.status(200).json({ status: 'success', data: players });
    }
    catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getAllPlayers = getAllPlayers;
const updatePlayer = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, branch_id, group_id, coach_id, status } = req.body;
        const updatedPlayer = await db_1.default.player.update({
            where: { id: id },
            data: { first_name, last_name, branch_id, group_id, coach_id, status }
        });
        res.status(200).json({ status: 'success', data: updatedPlayer });
    }
    catch (error) {
        console.error('Error updating player:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.updatePlayer = updatePlayer;
const deletePlayer = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.default.player.delete({
            where: { id: id }
        });
        res.status(200).json({ status: 'success', message: 'Player deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting player:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.deletePlayer = deletePlayer;
