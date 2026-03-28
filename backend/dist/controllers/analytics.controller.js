"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardAnalytics = void 0;
const db_1 = __importDefault(require("../db"));
const getDashboardAnalytics = async (req, res) => {
    try {
        // 1. KPIs
        const totalPlayers = await db_1.default.player.count();
        const activePlayers = await db_1.default.player.count({ where: { status: 'ACTIVE' } });
        // Monthly Revenue (current month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthlyPayments = await db_1.default.payment.aggregate({
            where: { date: { gte: startOfMonth } },
            _sum: { amount: true }
        });
        const monthlyRevenue = monthlyPayments._sum.amount || 0;
        // Overdue Calculations (Estimation based on status or last payment logic, implemented simplistically here)
        const overduePlayers = await db_1.default.player.count({ where: { status: 'SUSPENDED' } });
        // Attendance Rate (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const attendances = await db_1.default.attendance.groupBy({
            by: ['status'],
            where: { date: { gte: thirtyDaysAgo } },
            _count: true
        });
        let totalPresent = 0, totalAbsent = 0;
        attendances.forEach(a => {
            if (a.status === 'PRESENT')
                totalPresent += a._count;
            else
                totalAbsent += a._count;
        });
        const totalSessions = totalPresent + totalAbsent;
        const attendanceRate = totalSessions > 0 ? ((totalPresent / totalSessions) * 100).toFixed(1) : 0;
        // 2. Charts Data
        // Branch Distribution
        const branchDistribution = await db_1.default.player.groupBy({
            by: ['branch_id'],
            _count: true
        });
        // This ideally maps branch_id to branch name, but we return raw for now.
        // Recent Registrations Table Data
        const recentRegistrations = await db_1.default.player.findMany({
            take: 5,
            orderBy: { created_at: 'desc' },
            include: { branch: true }
        });
        res.status(200).json({
            status: 'success',
            data: {
                kpis: {
                    total_players: totalPlayers,
                    active_players: activePlayers,
                    monthly_revenue: monthlyRevenue,
                    overdue_players: overduePlayers,
                    attendance_rate: attendanceRate
                },
                charts: {
                    branch_distribution: branchDistribution
                },
                smart_tables: {
                    recent_registrations: recentRegistrations
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getDashboardAnalytics = getDashboardAnalytics;
