"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
class AuthService {
    generateJwtToken(userId, email) {
        const payload = {
            userId,
            email,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
        };
        return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'fallback-secret');
    }
    async registerUser(data) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email }
            });
            if (existingUser) {
                return {
                    success: false,
                    message: 'User with this email already exists'
                };
            }
            const hashedPassword = await bcrypt_1.default.hash(data.password, 12);
            const user = await prisma.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    businessEntityId: data.businessEntityId
                }
            });
            const token = this.generateJwtToken(user.id, user.email);
            return {
                success: true,
                message: 'User registered successfully',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailVerified: user.emailVerified,
                    businessEntityId: user.businessEntityId
                }
            };
        }
        catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Registration failed'
            };
        }
    }
    async loginUser(data) {
        try {
            const user = await prisma.user.findUnique({
                where: { email: data.email }
            });
            if (!user) {
                return {
                    success: false,
                    message: 'Invalid credentials'
                };
            }
            if (!user.isActive) {
                return {
                    success: false,
                    message: 'Account is deactivated'
                };
            }
            const isPasswordValid = await bcrypt_1.default.compare(data.password, user.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: 'Invalid credentials'
                };
            }
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() }
            });
            const token = this.generateJwtToken(user.id, user.email);
            return {
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailVerified: user.emailVerified,
                    businessEntityId: user.businessEntityId
                }
            };
        }
        catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Login failed'
            };
        }
    }
    async verifyEmail(token) {
        try {
            const user = await prisma.user.findFirst({
                where: { emailVerificationToken: token }
            });
            if (!user) {
                return {
                    success: false,
                    message: 'Invalid verification token'
                };
            }
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: true,
                    emailVerificationToken: null
                }
            });
            return {
                success: true,
                message: 'Email verified successfully'
            };
        }
        catch (error) {
            console.error('Email verification error:', error);
            return {
                success: false,
                message: 'Email verification failed'
            };
        }
    }
    async requestPasswordReset(email) {
        try {
            const user = await prisma.user.findUnique({
                where: { email }
            });
            if (!user) {
                return {
                    success: false,
                    message: 'If a user with this email exists, a reset link will be sent'
                };
            }
            const resetToken = crypto_1.default.randomBytes(32).toString('hex');
            const resetExpires = new Date(Date.now() + 3600000);
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    passwordResetToken: resetToken,
                    passwordResetExpires: resetExpires
                }
            });
            console.log(`Password reset token for ${email}: ${resetToken}`);
            return {
                success: true,
                message: 'Password reset link sent to your email'
            };
        }
        catch (error) {
            console.error('Password reset request error:', error);
            return {
                success: false,
                message: 'Password reset request failed'
            };
        }
    }
    async resetPassword(token, newPassword) {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    passwordResetToken: token,
                    passwordResetExpires: { gt: new Date() }
                }
            });
            if (!user) {
                return {
                    success: false,
                    message: 'Invalid or expired reset token'
                };
            }
            const hashedPassword = await bcrypt_1.default.hash(newPassword, 12);
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    passwordResetToken: null,
                    passwordResetExpires: null
                }
            });
            return {
                success: true,
                message: 'Password reset successfully'
            };
        }
        catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                message: 'Password reset failed'
            };
        }
    }
    async validateToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
            return {
                valid: true,
                userId: decoded.userId,
                email: decoded.email
            };
        }
        catch (error) {
            return { valid: false };
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map