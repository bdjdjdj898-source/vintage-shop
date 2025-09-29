"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const telegramAuth_1 = require("./telegramAuth");
const responses_1 = require("../utils/responses");
exports.requireAdmin = [
    telegramAuth_1.requireAuth,
    (req, res, next) => {
        if (!req.user) {
            return responses_1.ApiResponse.unauthorized(res, 'Требуется аутентификация');
        }
        if (req.user.role !== 'admin') {
            return responses_1.ApiResponse.forbidden(res, 'Доступ запрещён. Требуются права администратора.');
        }
        next();
    }
];
