import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { Role } from '@prisma/client';
import prisma from '../db';

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

export const checkCoachPermission = (permissionName: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const user = (req as any).user;

        if (!user || user.role !== 'COACH') {
            // If Admin is impersonating or user is SUPER_ADMIN, allow access
            if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
                next();
                return;
            }
            res.status(403).json({ status: 'error', message: 'Forbidden. Roles mismatch.' });
            return;
        }

        try {
            const coach = await prisma.coach.findUnique({
                where: { user_id: user.id }
            }) as any;

            if (!coach || !coach.permissions) {
                res.status(403).json({ status: 'error', message: 'Forbidden. No permissions assigned.' });
                return;
            }

            const perms = coach.permissions as any;
            if (perms[permissionName] !== true) {
                res.status(403).json({ status: 'error', message: `Forbidden. Missing ${permissionName} permission.` });
                return;
            }

            next();
        } catch (error) {
            res.status(500).json({ status: 'error', message: 'Internal server error checking permissions' });
        }
    };
};
