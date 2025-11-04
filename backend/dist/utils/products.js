"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProductWhere = buildProductWhere;
function getStringValue(value) {
    if (typeof value === 'string')
        return value;
    return undefined;
}
function getBooleanValue(value) {
    if (typeof value === 'boolean')
        return value;
    if (typeof value === 'string')
        return value === 'true';
    return undefined;
}
function buildProductWhere(filters, options = {}) {
    const { isAdmin = false } = options;
    const category = getStringValue(filters.category);
    const brand = getStringValue(filters.brand);
    const size = getStringValue(filters.size);
    const color = getStringValue(filters.color);
    const minCondition = getStringValue(filters.minCondition);
    const maxCondition = getStringValue(filters.maxCondition);
    const minPrice = getStringValue(filters.minPrice);
    const maxPrice = getStringValue(filters.maxPrice);
    const search = getStringValue(filters.search);
    const includeInactive = getBooleanValue(filters.includeInactive) ??
        (getStringValue(filters.includeInactive) === 'true');
    const where = {};
    if (isAdmin) {
        const shouldIncludeInactive = includeInactive === true || includeInactive === undefined;
        if (!shouldIncludeInactive) {
            where.isActive = true;
        }
    }
    else {
        const shouldIncludeInactive = includeInactive === true && isAdmin;
        if (!shouldIncludeInactive) {
            where.isActive = true;
        }
    }
    if (category)
        where.category = category;
    if (brand)
        where.brand = brand;
    if (size)
        where.size = size;
    if (color)
        where.color = color;
    if (minCondition || maxCondition) {
        where.condition = {};
        if (minCondition)
            where.condition.gte = Number(minCondition);
        if (maxCondition)
            where.condition.lte = Number(maxCondition);
    }
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice)
            where.price.gte = Number(minPrice);
        if (maxPrice)
            where.price.lte = Number(maxPrice);
    }
    return where;
}
