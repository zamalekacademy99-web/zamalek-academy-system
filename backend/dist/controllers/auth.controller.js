"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
const db_1 = __importDefault(require("../db"));
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ status: 'error', message: 'Email and password are required' });
            return;
        }
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user || !user.is_active) {
            res.status(401).json({ status: 'error', message: 'Invalid credentials or account inactive' });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            res.status(401).json({ status: 'error', message: 'Invalid credentials' });
            return;
        }
        const token = (0, jwt_1.generateToken)({ id: user.id, role: user.role });
        res.status(200).json({
            status: 'success',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        console.error('Login error details:', error);
        if (error.constructor.name === 'PrismaClientInitializationError' || error.message?.includes('PrismaClientInitializationError')) {
            console.error('❌ CRITICAL: Prisma failed to initialize or connect to the database in production.');
            res.status(500).json({ status: 'error', message: 'Database connection failed. Please check production DATABASE_URL and ensure Prisma is generated.' });
            return;
        }
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.login = login;
