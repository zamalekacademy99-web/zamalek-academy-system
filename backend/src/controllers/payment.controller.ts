import { Request, Response } from 'express';
import { PrismaClient, PaymentMethod, PlayerStatus } from '@prisma/client';

import prisma from '../db';


export const recordPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { player_id, amount, method, reference_no, notes, period_month, period_year, category } = req.body;

        if (!player_id || !amount || !method) {
            res.status(400).json({ status: 'error', message: 'player_id, amount, and method are required' });
            return;
        }

        const adminId = (req as any).user.id;
        const paymentAmount = parseFloat(amount);

        // 1. Get Player and Parent
        const player = await prisma.player.findUnique({
            where: { id: player_id },
            include: { parent: true, branch: { include: { pricing_plans: { where: { is_active: true }, take: 1 } } } }
        });

        if (!player) {
            res.status(404).json({ status: 'error', message: 'Player not found' });
            return;
        }

        // 2. Determine Monthly Fee (Priority: Branch Plan -> Default 500)
        const monthlyFee = Number(player.branch.pricing_plans[0]?.amount || 500);

        // 3. Logic: If amount > monthlyFee, extra goes to Parent Balance
        // For simplicity: We only apply credit if a month is specified and it's a "full month payment" or "excess"
        // If they pay 1000 for one month, 500 pays the month, 500 goes to Parent balance.
        let excessCredit = 0;
        if ((category === 'MONTHLY_FEE' || category === 'BOTH') && paymentAmount > monthlyFee) {
            excessCredit = paymentAmount - monthlyFee;
        }

        // 4. Create Payment Record (Linked to specific month if provided)
        const newPayment = await prisma.payment.create({
            data: {
                player_id,
                amount: paymentAmount,
                method: method as PaymentMethod,
                reference_no,
                date: new Date(),
                recorded_by: adminId,
                period_month: period_month ? parseInt(period_month) : (new Date().getMonth() + 1),
                period_year: period_year ? parseInt(period_year) : new Date().getFullYear(),
                category: category || 'MONTHLY_FEE',
                notes
            }
        });

        // 5. Update Parent Balance if there's excess
        if (excessCredit > 0) {
            await prisma.parent.update({
                where: { id: player.parent_id },
                data: { balance: { increment: excessCredit } }
            });
        }

        res.status(201).json({ status: 'success', data: newPayment, message: excessCredit > 0 ? `Payment recorded. ${excessCredit} ج.م added to parent credit.` : 'Payment recorded successfully.' });
    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const getPlayerFinancialStatement = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const player = await prisma.player.findUnique({
            where: { id: id as string },
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
        const totalPaid = (player as any).payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
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
                    payments: (player as any).payments
                }
            }
        });
    } catch (error) {
        console.error('Error fetching statement:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { recorder_id } = req.query;
        const filter = recorder_id ? { recorded_by: String(recorder_id) } : {};

        const payments = await prisma.payment.findMany({
            where: filter,
            include: {
                player: true,
                recorder: { select: { name: true } }
            },
            orderBy: { date: 'desc' }
        });

        res.status(200).json({ status: 'success', data: payments });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

export const getMonthlyFinancialStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { branch_id, month, year } = req.query;
        const m = month ? parseInt(String(month)) : (new Date().getMonth() + 1);
        const y = year ? parseInt(String(year)) : new Date().getFullYear();

        const players = await prisma.player.findMany({
            where: branch_id ? { branch_id: String(branch_id) } : {},
            include: {
                parent: true,
                branch: { include: { pricing_plans: { where: { is_active: true }, take: 1 } } },
                payments: {
                    where: { period_month: m, period_year: y }
                }
            }
        });

        const statusReport = players.map(player => {
            const monthlyFee = Number(player.branch.pricing_plans[0]?.amount || 500);
            const totalPaidForPeriod = player.payments.reduce((sum, p) => sum + Number(p.amount), 0);

            let status = 'PENDING';
            if (totalPaidForPeriod >= monthlyFee) status = 'PAID';
            else if (new Date().getDate() > 10 && totalPaidForPeriod < monthlyFee) status = 'OVERDUE';

            return {
                player_id: player.id,
                name: `${player.first_name} ${player.last_name}`,
                parent_phone: player.parent.phone,
                fee: monthlyFee,
                paid: totalPaidForPeriod,
                status
            };
        });

        res.status(200).json({ status: 'success', data: statusReport });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
