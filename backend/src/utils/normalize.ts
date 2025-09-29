export const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) {
    return v.filter(x => typeof x === 'string');
  }
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const stringifyJson = (v: any): string => {
  try {
    return JSON.stringify(v);
  } catch {
    return '[]';
  }
};

export const parseJsonString = (v: string | null): any => {
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};