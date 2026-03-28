"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceBySchedule = exports.recordBatchAttendance = void 0;
const db_1 = __importDefault(require("../db"));
const recordBatchAttendance = async (req, res) => {
    try {
        const { schedule_id, date, attendance_records } = req.body;
        // attendance_records should be an array: { player_id: string, status: AttendanceStatus, notes?: string }[]
        if (!schedule_id || !date || !Array.isArray(attendance_records)) {
            res.status(400).json({ status: 'error', message: 'Invalid payload for batch attendance' });
            return;
        }
        const parsedDate = new Date(date);
        // Use Prisma transaction to perform bulk upsert (create or update if exists)
        const operations = attendance_records.map(record => {
            return db_1.default.attendance.upsert({
                where: {
                    player_id_schedule_id_date: {
                        player_id: record.player_id,
                        schedule_id,
                        date: parsedDate
                    }
                },
                update: {
                    status: record.status,
                    notes: record.notes
                },
                create: {
                    player_id: record.player_id,
                    schedule_id,
                    date: parsedDate,
                    status: record.status,
                    notes: record.notes
                }
            });
        });
        await db_1.default.$transaction(operations);
        res.status(200).json({ status: 'success', message: 'Attendance recorded successfully' });
    }
    catch (error) {
        console.error('Error recording batch attendance:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.recordBatchAttendance = recordBatchAttendance;
const getAttendanceBySchedule = async (req, res) => {
    try {
        const { schedule_id, date } = req.query;
        if (!schedule_id || !date) {
            res.status(400).json({ status: 'error', message: 'schedule_id and date are required' });
            return;
        }
        const records = await db_1.default.attendance.findMany({
            where: {
                schedule_id: String(schedule_id),
                date: new Date(String(date))
            },
            include: {
                player: true
            }
        });
        res.status(200).json({ status: 'success', data: records });
    }
    catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getAttendanceBySchedule = getAttendanceBySchedule;
