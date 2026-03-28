"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPayments = exports.getPlayerFinancialStatement = exports.recordPayment = void 0;
const db_1 = __importDefault(require("../db"));
const recordPayment = async (req, res) => {
    try {
        const { player_id, amount, method, reference_no, notes } = req.body;
        if (!player_id || !amount || !method) {
            res.status(400).json({ status: 'error', message: 'player_id, amount, and method are required' });
            return;
        }
        const adminId = req.user.id;
        const newPayment = await db_1.default.payment.create({
            data: {
                player_id,
                amount: parseFloat(amount),
                method: method,
                reference_no,
                date: new Date(),
                recorded_by: adminId,
                notes
            }
        });
        res.status(201).json({ status: 'success', data: newPayment });
    }
    catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.recordPayment = recordPayment;
const getPlayerFinancialStatement = async (req, res) => {
    try {
        const { id } = req.params;
        const player = await db_1.default.player.findUnique({
            where: { id: id },
            include: {
                payments: { orderBy: { date: 'desc' } },
                group: { include: { branch: true } }
            }
        });
        if (!player) {
            res.status(404).json({ status: 'error', message: 'Player not found' });
            return;
        }
        // Dynamic Balance Calculation Logic:
        // This is a simplified version. A real app might have 'DueInvoices' table.
        // Here we find the pricing plan for the player's group branch or standard.
        // Fallback fixed pricing logic for demonstration
        const monthly_fee = 500; // Expected from pricing plan
        // Calculate months since subscription start
        const monthsActive = Math.max(1, (new Date().getTime() - new Date(player.subscription_start_date).getTime()) / (1000 * 60 * 60 * 24 * 30));
        const totalRequired = Math.ceil(monthsActive) * monthly_fee;
        // Sum total paid
        const totalPaid = player.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const balance = totalRequired - totalPaid;
        res.status(200).json({
            status: 'success',
            data: {
                player: {
                    id: player.id,
                    name: `${player.first_name} ${player.last_name}`,
                    status: player.status
                },
                financials: {
                    total_required: totalRequired,
                    total_paid: totalPaid,
                    outstanding_balance: balance > 0 ? balance : 0,
                    payments: player.payments
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching statement:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getPlayerFinancialStatement = getPlayerFinancialStatement;
const getAllPayments = async (req, res) => {
    try {
        const payments = await db_1.default.payment.findMany({
            include: {
                player: true,
                recorder: { select: { name: true } }
            },
            orderBy: { date: 'desc' }
        });
        res.status(200).json({ status: 'success', data: payments });
    }
    catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getAllPayments = getAllPayments;
