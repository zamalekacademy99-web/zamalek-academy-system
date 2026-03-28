"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_1 = require("../controllers/attendance.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticate, attendance_controller_1.getAttendanceBySchedule);
router.post('/batch', auth_middleware_1.authenticate, attendance_controller_1.recordBatchAttendance);
exports.default = router;
