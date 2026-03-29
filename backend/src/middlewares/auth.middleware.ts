import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { Role } from '@prisma/client';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ status: 'error', message: 'Unauthorized. Token missing.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        (req as any).user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ status: 'error', message: 'Unauthorized. Token invalid or expired.' });
    }
};

export const authorize = (allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const userRole = (req as any).user?.role;

        if (!userRole) {
            res.status(403).json({ status: 'error', message: 'Forbidden. No role found.' });
            return;
        }

        // ADMIN BYPASS: Super Admins and Admins can access any route
        // This allows admin impersonation of coach portal pages
        if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
            next();
            return;
        }

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({ status: 'error', message: 'Forbidden. You do not have permission.' });
            return;
        }

        next();
    };
};
