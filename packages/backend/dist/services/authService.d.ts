interface UserRegistrationData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    businessEntityId: string;
}
interface UserLoginData {
    email: string;
    password: string;
}
interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        emailVerified: boolean;
        businessEntityId: string;
    };
}
export declare class AuthService {
    generateJwtToken(userId: string, email: string): string;
    registerUser(data: UserRegistrationData): Promise<AuthResponse>;
    loginUser(data: UserLoginData): Promise<AuthResponse>;
    verifyEmail(token: string): Promise<AuthResponse>;
    requestPasswordReset(email: string): Promise<AuthResponse>;
    resetPassword(token: string, newPassword: string): Promise<AuthResponse>;
    validateToken(token: string): Promise<{
        valid: boolean;
        userId?: string;
        email?: string;
    }>;
}
export {};
//# sourceMappingURL=authService.d.ts.map