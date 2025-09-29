"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdMiddleware = void 0;
const uuid_1 = require("uuid");
const logger_1 = __importDefault(require("../lib/logger"));
const requestIdMiddleware = (req, res, next) => {
    const requestId = req.headers['x-request-id'] || (0, uuid_1.v4)();
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    const startTime = Date.now();
    logger_1.default.info('Request started', {
        reqId: requestId,
        method: req.method,
        url: req.originalUrl,
        userAgent: req.headers['user-agent'],
        ip: req.ip
    });
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const duration = Date.now() - startTime;
        logger_1.default.info('Request completed', {
            reqId: requestId,
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            contentLength: res.get('content-length')
        });
        return originalEnd.call(this, chunk, encoding);
    };
    next();
};
exports.requestIdMiddleware = requestIdMiddleware;
