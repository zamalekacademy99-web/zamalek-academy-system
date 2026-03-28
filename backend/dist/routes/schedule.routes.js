"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schedule_controller_1 = require("../controllers/schedule.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticate, schedule_controller_1.getAllSchedules);
router.post('/', auth_middleware_1.authenticate, schedule_controller_1.createSchedule); // Admins can create schedules
exports.default = router;
