// Central fetch wrapper: talks to the Veloura backend, attaches JWT, and normalizes errors.

function getApiBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const trimmed = envUrl.trim();
    // If the browser is in a remote environment (e.g. Cloud Run or shared URL),
    // do not attempt to contact localhost
    if (typeof window !== 'undefined' && (trimmed.includes('localhost') || trimmed.includes('127.0.0.1'))) {
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return '/api';
      }
    }
    return trimmed.replace(/\/+$/, '');
  }
  return '/api';
}

export const API_BASE_URL = getApiBaseUrl();

const USER_TOKEN_KEY = 'veloura_token';
const ADMIN_TOKEN_KEY = 'veloura_admin_token';

export const tokenStore = {
  getUserToken: () => localStorage.getItem(USER_TOKEN_KEY),
  setUserToken: (token: string) => localStorage.setItem(USER_TOKEN_KEY, token),
  clearUserToken: () => localStorage.removeItem(USER_TOKEN_KEY),
  getAdminToken: () => localStorage.getItem(ADMIN_TOKEN_KEY),
  setAdminToken: (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token),
  clearAdminToken: () => localStorage.removeItem(ADMIN_TOKEN_KEY),
};

interface RequestOptions extends RequestInit {
  asAdmin?: boolean;
  skipAuth?: boolean;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const { asAdmin, skipAuth, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> | undefined),
  };

  if (!skipAuth) {
    const token = asAdmin ? tokenStore.getAdminToken() : tokenStore.getUserToken();
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const targetUrl = cleanBase.endsWith('/api') && cleanPath.startsWith('/api/')
    ? `${cleanBase}${cleanPath.substring(4)}`
    : `${cleanBase}${cleanPath}`;

  const isGet = !rest.method || rest.method.toUpperCase() === 'GET';
  const maxRetries = isGet ? 2 : 1;
  let attempt = 0;
  let lastError: any = null;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(targetUrl, {
        ...rest,
        headers: finalHeaders,
      });

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json().catch(() => ({})) : null;

      if (!response.ok) {
        throw new ApiError(data?.message || 'Request failed. Please try again.', response.status);
      }

      return data as T;
    } catch (netErr: any) {
      lastError = netErr;
      if (netErr instanceof ApiError && netErr.status > 0) {
        // HTTP error from server (not a network drop), do not retry
        throw netErr;
      }
      attempt++;
      if (attempt <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 250));
      }
    }
  }

  throw new ApiError(
    lastError?.message && !lastError.message.includes('Failed to fetch')
      ? lastError.message
      : 'Unable to connect to server. Please check your connection and try again.',
    0
  );
}
