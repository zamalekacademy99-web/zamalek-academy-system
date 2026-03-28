"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parent_controller_1 = require("../controllers/parent.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Strict authorizaton: must be logged in AND have PARENT role
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['PARENT']));
router.get('/dashboard', parent_controller_1.getDashboard);
router.get('/children', parent_controller_1.getChildren);
router.get('/attendance/:childId', parent_controller_1.getChildAttendance);
router.get('/payments/:childId', parent_controller_1.getChildPayments);
router.get('/evaluations/:childId', parent_controller_1.getChildEvaluations);
router.get('/notifications', parent_controller_1.getNotifications);
router.post('/request', parent_controller_1.submitRequest);
exports.default = router;
