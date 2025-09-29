"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasDbId = hasDbId;
exports.isInitDataOnly = isInitDataOnly;
exports.getAuthenticatedUser = getAuthenticatedUser;
function hasDbId(user) {
    return !user.isFromInitData && 'id' in user;
}
function isInitDataOnly(user) {
    return user.isFromInitData === true;
}
function getAuthenticatedUser(user) {
    if (!user) {
        throw new Error('User not authenticated');
    }
    if (!hasDbId(user)) {
        throw new Error('User not in database');
    }
    return user;
}
