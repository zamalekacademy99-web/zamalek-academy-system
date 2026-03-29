// Force Re-deployment: v1.0.1 (Phase 9 Finalized)
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

// ----------------------------------------------------------------
// CORS — must come BEFORE helmet so preflight OPTIONS isn't blocked
// Set CORS_ORIGIN in Railway to your Vercel domain(s) comma-separated.
// If unset, all origins are allowed (wildcard).
// ----------------------------------------------------------------
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['*'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow server-to-server requests with no Origin header
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
}));

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());

// ----------------------------------------------------------------
// API Routes
// ----------------------------------------------------------------
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

// ----------------------------------------------------------------
// System Routes
// ----------------------------------------------------------------
app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Zamalek Academy API is running',
        port: String(port),
        env: process.env.NODE_ENV || 'development'
    });
});

// Route catalogue (safe debug endpoint — no secrets exposed)
app.get('/api/v1/routes', (_req: Request, res: Response) => {
    res.json({
        endpoints: [
            'GET    /api/v1/health',
            'GET    /api/v1/players',
            'GET    /api/v1/players/:id',
            'POST   /api/v1/players/register',
            'PUT    /api/v1/players/:id',
            'DELETE /api/v1/players/:id',
            'GET    /api/v1/coaches',
            'GET    /api/v1/coaches/:id',
            'PUT    /api/v1/coaches/:id',
            'GET    /api/v1/coach/dashboard',
            'GET    /api/v1/coach/group/:id/players',
            'POST   /api/v1/coach/attendance',
            'POST   /api/v1/coach/evaluate',
            'POST   /api/v1/messages',
            'GET    /api/v1/messages/parent/:parentId',
            'PATCH  /api/v1/messages/:id/read',
        ]
    });
});

// 404 catch-all — returns JSON instead of Express HTML default
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        status: 'error',
        message: `Route not found: ${_req.method} ${_req.path}`
    });
});

// ----------------------------------------------------------------
// Server startup
// ----------------------------------------------------------------
if (process.env.NODE_ENV !== 'test') {
    startAutomationService();
}

app.listen(port, () => {
    console.log(`[SERVER] ✅ Running on port ${port}`);
    console.log(`[SERVER] CORS origins: ${process.env.CORS_ORIGIN || 'ALL (wildcard)'}`);
    console.log(`[SERVER] NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});
