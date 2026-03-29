import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import branchRoutes from './routes/branch.routes';
import groupRoutes from './routes/group.routes';
import coachRoutes from './routes/coach.routes';
import playerRoutes from './routes/player.routes';
import scheduleRoutes from './routes/schedule.routes';
import attendanceRoutes from './routes/attendance.routes';
import paymentRoutes from './routes/payment.routes';
import parentRoutes from './routes/parent.routes';
import analyticsRoutes from './routes/analytics.routes';
import notificationRoutes from './routes/notification.routes';
import coachPortalRoutes from './routes/coach-portal.routes';
import messageRoutes from './routes/message.routes';
import { startAutomationService } from './services/automation.service';



const app = express();
const port = process.env.PORT || 8000;

// CORS — allow any origin OR lock to specific Vercel domain via CORS_ORIGIN env var
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['*'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/branches', branchRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/coaches', coachRoutes);
app.use('/api/v1/players', playerRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/parent', parentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/coach', coachPortalRoutes);
app.use('/api/v1/messages', messageRoutes);

// Basic health check route
app.get('/api/v1/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'success', message: 'Zamalek Academy API is running' });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
    startAutomationService();
}
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
