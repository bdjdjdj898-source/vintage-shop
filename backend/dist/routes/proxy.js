"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middleware/validateRequest");
const logger_1 = __importDefault(require("../lib/logger"));
const router = (0, express_1.Router)();
router.get('/image/:encodedUrl', [
    (0, express_validator_1.param)('encodedUrl').isString(),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const encodedUrl = req.params.encodedUrl;
        const imageUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');
        try {
            new URL(imageUrl);
        }
        catch {
            return res.status(400).json({ error: 'Invalid URL' });
        }
        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        if (!response.ok) {
            logger_1.default.error('Failed to fetch image', { imageUrl, status: response.status });
            return res.status(response.status).json({ error: 'Failed to fetch image' });
        }
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
    }
    catch (error) {
        logger_1.default.error('Error proxying image', {
            error: error instanceof Error ? error.message : error
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
