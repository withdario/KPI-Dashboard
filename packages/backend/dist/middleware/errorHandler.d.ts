import { Request, Response, NextFunction } from 'express';
export declare class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    retryable: boolean;
    retryAfter?: number;
    constructor(statusCode: number, message: string, isOperational?: boolean, retryable?: boolean, retryAfter?: number);
}
export declare class DatabaseError extends ApiError {
    constructor(message: string, retryable?: boolean);
}
export declare class ExternalApiError extends ApiError {
    constructor(message: string, statusCode?: number, retryable?: boolean);
}
export declare class ValidationError extends ApiError {
    constructor(message: string);
}
export declare class AuthenticationError extends ApiError {
    constructor(message: string);
}
export declare class AuthorizationError extends ApiError {
    constructor(message: string);
}
export declare class NotFoundError extends ApiError {
    constructor(message: string);
}
export declare class ConflictError extends ApiError {
    constructor(message: string);
}
export declare class RateLimitError extends ApiError {
    constructor(message: string, retryAfter?: number);
}
interface CircuitBreakerState {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number;
    nextAttemptTime: number;
    threshold: number;
    timeout: number;
}
declare class CircuitBreaker {
    private state;
    private readonly name;
    constructor(name: string, threshold?: number, timeout?: number);
    canExecute(): boolean;
    onSuccess(): void;
    onFailure(): void;
    getState(): CircuitBreakerState;
}
export declare const getCircuitBreaker: (name: string) => CircuitBreaker;
export declare const errorHandler: (err: Error | ApiError, req: Request, res: Response, _next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare const asyncHandler: (fn: Function, circuitBreakerName?: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const withCircuitBreaker: <T>(name: string, operation: () => Promise<T>, fallback?: () => T | Promise<T>) => Promise<T>;
export declare const withRetry: <T>(operation: () => Promise<T>, maxRetries?: number, baseDelay?: number, maxDelay?: number) => Promise<T>;
export declare const withGracefulDegradation: <T>(primaryOperation: () => Promise<T>, fallbackOperation: () => Promise<T>, circuitBreakerName?: string) => Promise<T>;
export declare const getCircuitBreakerHealth: () => Record<string, any>;
export {};
//# sourceMappingURL=errorHandler.d.ts.map