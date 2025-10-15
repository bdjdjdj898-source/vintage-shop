import { ParsedQs } from 'qs';

interface ProductFilters {
  category?: string | ParsedQs | (string | ParsedQs)[];
  brand?: string | ParsedQs | (string | ParsedQs)[];
  size?: string | ParsedQs | (string | ParsedQs)[];
  color?: string | ParsedQs | (string | ParsedQs)[];
  minCondition?: string | number | ParsedQs | (string | ParsedQs)[];
  maxCondition?: string | number | ParsedQs | (string | ParsedQs)[];
  minPrice?: string | number | ParsedQs | (string | ParsedQs)[];
  maxPrice?: string | number | ParsedQs | (string | ParsedQs)[];
  search?: string | ParsedQs | (string | ParsedQs)[];
  includeInactive?: string | boolean | ParsedQs | (string | ParsedQs)[];
}

interface FilterOptions {
  isAdmin?: boolean;
}

/**
 * Builds a Prisma where clause for product filtering
 * @param filters - The filter parameters from query string
 * @param options - Additional options like admin status
 * @returns Prisma where clause object
 */
/**
 * Helper function to safely extract string value from Express query parameter
 */
function getStringValue(value: string | ParsedQs | (string | ParsedQs)[] | undefined): string | undefined {
  if (typeof value === 'string') return value;
  return undefined;
}

/**
 * Helper function to safely extract boolean value from Express query parameter
 */
function getBooleanValue(value: string | boolean | ParsedQs | (string | ParsedQs)[] | undefined): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return undefined;
}

export function buildProductWhere(filters: ProductFilters, options: FilterOptions = {}): any {
  const { isAdmin = false } = options;

  // Extract and normalize filter values
  const category = getStringValue(filters.category);
  const brand = getStringValue(filters.brand);
  const size = getStringValue(filters.size);
  const color = getStringValue(filters.color);
  const minCondition = getStringValue(filters.minCondition as any);
  const maxCondition = getStringValue(filters.maxCondition as any);
  const minPrice = getStringValue(filters.minPrice as any);
  const maxPrice = getStringValue(filters.maxPrice as any);
  const search = getStringValue(filters.search);
  const includeInactive = getBooleanValue(filters.includeInactive) ??
    (getStringValue(filters.includeInactive as any) === 'true');

  const where: any = {};

  // Handle isActive filtering
  if (isAdmin) {
    // Admin can see all products including inactive by default
    // Only filter if explicitly requested NOT to include inactive
    const shouldIncludeInactive = includeInactive === true || includeInactive === undefined;
    if (!shouldIncludeInactive) {
      where.isActive = true;
    }
  } else {
    // Regular users only see active products by default, unless includeInactive is true and they are admin
    const shouldIncludeInactive = includeInactive === true && isAdmin;
    if (!shouldIncludeInactive) {
      where.isActive = true;
    }
  }

  // Basic field filters
  if (category) where.category = category;
  if (brand) where.brand = brand;
  if (size) where.size = size;
  if (color) where.color = color;

  // Search functionality
  // SQLite doesn't support case-insensitive mode, so we search as-is
  // In production with PostgreSQL, you can use mode: 'insensitive'
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { brand: { contains: search } }
    ];
  }

  // Condition range filtering
  if (minCondition || maxCondition) {
    where.condition = {};
    if (minCondition) where.condition.gte = Number(minCondition);
    if (maxCondition) where.condition.lte = Number(maxCondition);
  }

  // Price range filtering
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  return where;
}