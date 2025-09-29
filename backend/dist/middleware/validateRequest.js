"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const responses_1 = require("../utils/responses");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.type === 'field' ? error.path : error.type,
            message: error.msg,
            value: error.type === 'field' ? error.value : undefined
        }));
        return responses_1.ApiResponse.validationError(res, 'Ошибка валидации данных', errorMessages);
    }
    next();
};
exports.validateRequest = validateRequest;
