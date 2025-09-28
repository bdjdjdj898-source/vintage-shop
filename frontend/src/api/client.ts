export class ApiError extends Error {
  code?: string;
  details?: any;
  status: number;
  constructor(status: number, code?: string, message?: string, details?: any) {
    super(message || 'Request failed');
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  size?: string;
  color?: string;
  minCondition?: string;
  maxCondition?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  sort?: string;
}

export function buildQueryString(params: Record<string, any>): string {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, item.toString()));
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });

  return queryParams.toString();
}

let initData: string | null = null;
export function setTelegramInitData(v: string | null) { initData = v; }

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (initData) headers.set('x-telegram-init-data', initData);

  // Add debug auth header in DEV mode with secret
  if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_AUTH_SECRET) {
    headers.set('x-debug-auth', import.meta.env.VITE_DEBUG_AUTH_SECRET);
  }

  const res = await fetch(path, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    if (isJson && payload?.error) {
      throw new ApiError(res.status, payload.error.code, payload.error.message, payload.error.details);
    }
    throw new ApiError(res.status, undefined, typeof payload === 'string' ? payload : 'Request failed');
  }

  return payload;
}