"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["AUTH_REQUIRED"] = "AUTH_REQUIRED";
    ErrorCode["AUTH_INVALID"] = "AUTH_INVALID";
    ErrorCode["ACCESS_DENIED"] = "ACCESS_DENIED";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["ALREADY_EXISTS"] = "ALREADY_EXISTS";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["INVALID_INPUT"] = "INVALID_INPUT";
    ErrorCode["CART_EMPTY"] = "CART_EMPTY";
    ErrorCode["PRODUCT_UNAVAILABLE"] = "PRODUCT_UNAVAILABLE";
    ErrorCode["ORDER_NOT_PROCESSABLE"] = "ORDER_NOT_PROCESSABLE";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
class ApiResponse {
    static success(res, data, statusCode = 200) {
        const response = {
            success: true,
            data,
            timestamp: new Date().toISOString()
        };
        return res.status(statusCode).json(response);
    }
    static paginated(res, data, pagination, statusCode = 200) {
        const response = {
            success: true,
            data,
            pagination,
            timestamp: new Date().toISOString()
        };
        return res.status(statusCode).json(response);
    }
    static error(res, code, message, statusCode = 400, details) {
        const response = {
            success: false,
            error: {
                code,
                message,
                ...(details && { details })
            },
            timestamp: new Date().toISOString()
        };
        return res.status(statusCode).json(response);
    }
    static unauthorized(res, message = 'Требуется аутентификация') {
        return this.error(res, ErrorCode.AUTH_REQUIRED, message, 401);
    }
    static forbidden(res, message = 'Доступ запрещен') {
        return this.error(res, ErrorCode.ACCESS_DENIED, message, 403);
    }
    static notFound(res, message = 'Ресурс не найден') {
        return this.error(res, ErrorCode.NOT_FOUND, message, 404);
    }
    static validationError(res, message = 'Ошибка валидации', details) {
        return this.error(res, ErrorCode.VALIDATION_ERROR, message, 400, details);
    }
    static internalError(res, message = 'Внутренняя ошибка сервера') {
        return this.error(res, ErrorCode.INTERNAL_ERROR, message, 500);
    }
    static businessError(res, code, message) {
        return this.error(res, code, message, 400);
    }
}
exports.ApiResponse = ApiResponse;
