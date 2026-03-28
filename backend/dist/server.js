"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const branch_routes_1 = __importDefault(require("./routes/branch.routes"));
const group_routes_1 = __importDefault(require("./routes/group.routes"));
const coach_routes_1 = __importDefault(require("./routes/coach.routes"));
const player_routes_1 = __importDefault(require("./routes/player.routes"));
const schedule_routes_1 = __importDefault(require("./routes/schedule.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const parent_routes_1 = __importDefault(require("./routes/parent.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const automation_service_1 = require("./services/automation.service");
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/branches', branch_routes_1.default);
app.use('/api/v1/groups', group_routes_1.default);
app.use('/api/v1/coaches', coach_routes_1.default);
app.use('/api/v1/players', player_routes_1.default);
app.use('/api/v1/schedules', schedule_routes_1.default);
app.use('/api/v1/attendance', attendance_routes_1.default);
app.use('/api/v1/payments', payment_routes_1.default);
app.use('/api/v1/parent', parent_routes_1.default);
app.use('/api/v1/analytics', analytics_routes_1.default);
app.use('/api/v1/notifications', notification_routes_1.default);
// Basic health check route
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Zamalek Academy API is running' });
});
// Start server
if (process.env.NODE_ENV !== 'test') {
    (0, automation_service_1.startAutomationService)();
}
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
