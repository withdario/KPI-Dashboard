/**
 * General rate limiting for all routes
 */
export declare const generalRateLimit: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Stricter rate limiting for authentication endpoints
 */
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiting for password reset requests
 */
export declare const passwordResetRateLimit: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimit.d.ts.map