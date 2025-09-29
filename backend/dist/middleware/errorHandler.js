"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.errorHandler = void 0;
const responses_1 = require("../utils/responses");
const errorHandler = (error, req, res, next) => {
    console.error('🔥 Error:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    const statusCode = error.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';
    let errorCode;
    switch (statusCode) {
        case 401:
            errorCode = responses_1.ErrorCode.AUTH_REQUIRED;
            break;
        case 403:
            errorCode = responses_1.ErrorCode.ACCESS_DENIED;
            break;
        case 404:
            errorCode = responses_1.ErrorCode.NOT_FOUND;
            break;
        case 400:
            errorCode = responses_1.ErrorCode.VALIDATION_ERROR;
            break;
        default:
            errorCode = responses_1.ErrorCode.INTERNAL_ERROR;
    }
    const details = isDevelopment ? {
        stack: error.stack,
        originalMessage: error.message,
        path: req.url,
        method: req.method
    } : undefined;
    const message = statusCode >= 500 ? 'Внутренняя ошибка сервера' : error.message;
    return responses_1.ApiResponse.error(res, errorCode, message, statusCode, details);
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
