interface CreateUserData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    businessEntityId: string;
}
interface UpdateUserData {
    firstName?: string;
    lastName?: string;
    email?: string;
    isActive?: boolean;
}
interface UserResponse {
    success: boolean;
    message: string;
    user?: any;
    users?: any[];
}
export declare class UserManagementService {
    createUser(data: CreateUserData): Promise<UserResponse>;
    getUser(id: string): Promise<UserResponse>;
    getAllUsers(businessEntityId?: string): Promise<UserResponse>;
    updateUser(id: string, data: UpdateUserData): Promise<UserResponse>;
    deleteUser(id: string): Promise<UserResponse>;
    deactivateUser(id: string): Promise<UserResponse>;
    reactivateUser(id: string): Promise<UserResponse>;
    changePassword(id: string, newPassword: string): Promise<UserResponse>;
    getUserStats(businessEntityId?: string): Promise<UserResponse>;
    searchUsers(query: string, businessEntityId?: string): Promise<UserResponse>;
}
export {};
//# sourceMappingURL=userManagementService.d.ts.map