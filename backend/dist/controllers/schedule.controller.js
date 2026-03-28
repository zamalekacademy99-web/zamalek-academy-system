"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchedule = exports.getAllSchedules = void 0;
const db_1 = __importDefault(require("../db"));
const getAllSchedules = async (req, res) => {
    try {
        const { branch_id, coach_id, group_id } = req.query;
        // Build dynamic filter
        const filter = {};
        if (branch_id)
            filter.branch_id = String(branch_id);
        if (coach_id)
            filter.coach_id = String(coach_id);
        if (group_id)
            filter.group_id = String(group_id);
        const schedules = await db_1.default.schedule.findMany({
            where: filter,
            include: {
                branch: true,
                group: true,
                coach: true
            },
            orderBy: [
                { day_of_week: 'asc' },
                { start_time: 'asc' }
            ]
        });
        res.status(200).json({ status: 'success', data: schedules });
    }
    catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getAllSchedules = getAllSchedules;
const createSchedule = async (req, res) => {
    try {
        const { branch_id, group_id, coach_id, day_of_week, start_time, end_time, field_name } = req.body;
        if (!branch_id || !group_id || !coach_id || day_of_week === undefined || !start_time || !end_time) {
            res.status(400).json({ status: 'error', message: 'Missing required training schedule fields' });
            return;
        }
        const newSchedule = await db_1.default.schedule.create({
            data: {
                branch_id,
                group_id,
                coach_id,
                day_of_week: parseInt(day_of_week),
                start_time,
                end_time,
                field_name
            }
        });
        res.status(201).json({ status: 'success', data: newSchedule });
    }
    catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.createSchedule = createSchedule;
