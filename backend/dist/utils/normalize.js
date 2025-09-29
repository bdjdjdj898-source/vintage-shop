"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsonString = exports.stringifyJson = exports.toStringArray = void 0;
const toStringArray = (v) => {
    if (Array.isArray(v)) {
        return v.filter(x => typeof x === 'string');
    }
    if (typeof v === 'string') {
        try {
            const parsed = JSON.parse(v);
            return Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : [];
        }
        catch {
            return [];
        }
    }
    return [];
};
exports.toStringArray = toStringArray;
const stringifyJson = (v) => {
    try {
        return JSON.stringify(v);
    }
    catch {
        return '[]';
    }
};
exports.stringifyJson = stringifyJson;
const parseJsonString = (v) => {
    if (!v)
        return null;
    try {
        return JSON.parse(v);
    }
    catch {
        return null;
    }
};
exports.parseJsonString = parseJsonString;
