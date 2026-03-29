import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';
import prisma from '../db';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ status: 'error', message: 'Email and password are required' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.is_active) {
            res.status(401).json({ status: 'error', message: 'Invalid credentials or account inactive' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            res.status(401).json({ status: 'error', message: 'Invalid credentials' });
            return;
        }

        const token = generateToken({ id: user.id, role: user.role });

        let coachId = null;
        if (user.role === 'COACH') {
            const coach = await prisma.coach.findUnique({ where: { user_id: user.id } });
            coachId = coach?.id;
        }

        res.status(200).json({
            status: 'success',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    coachId, // Associated coach ID
                },
            },
        });

    } catch (error: any) {
        console.error('Login error details:', error);

        if (error.constructor.name === 'PrismaClientInitializationError' || error.message?.includes('PrismaClientInitializationError')) {
            console.error('❌ CRITICAL: Prisma failed to initialize or connect to the database in production.');
            res.status(500).json({ status: 'error', message: 'Database connection failed. Please check production DATABASE_URL and ensure Prisma is generated.' });
            return;
        }

        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
