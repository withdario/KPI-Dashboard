"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmailVerification = exports.validatePasswordResetConfirm = exports.validatePasswordResetRequest = exports.validateLogin = exports.validateRegistration = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map((err) => ({
                field: err.type === 'field' ? err.path : 'unknown',
                message: err.msg,
                value: err.type === 'field' ? err.value : undefined
            }))
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
/**
 * User registration validation rules
 */
exports.validateRegistration = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    (0, express_validator_1.body)('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters'),
    exports.handleValidationErrors
];
/**
 * User login validation rules
 */
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
    exports.handleValidationErrors
];
/**
 * Password reset request validation
 */
exports.validatePasswordResetRequest = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    exports.handleValidationErrors
];
/**
 * Password reset confirmation validation
 */
exports.validatePasswordResetConfirm = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    exports.handleValidationErrors
];
/**
 * Email verification validation
 */
exports.validateEmailVerification = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Verification token is required'),
    exports.handleValidationErrors
];
//# sourceMappingURL=validation.js.map