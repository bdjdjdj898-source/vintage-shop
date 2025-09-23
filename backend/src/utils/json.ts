/**
 * Safely parse JSON string to array, returning empty array on failure
 */
export const parseJsonArray = (s?: string): any[] => {
  try {
    const v = JSON.parse(s ?? '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};