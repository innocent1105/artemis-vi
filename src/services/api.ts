/**
 * ASTRA HEALTH API Client.
 * Provides typed fetch wrappers for communicating with the PHP backend.
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

let csrfToken: string | null = null;

function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

function getCsrfToken(): string | null {
  return csrfToken;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add CSRF token for state-changing requests
  if (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE' || options.method === 'PATCH') {
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  if (options.headers) {
    if (typeof options.headers === 'object' && !Array.isArray(options.headers)) {
      for (const [key, value] of Object.entries(options.headers as Record<string, string>)) {
        headers[key] = value;
      }
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Send cookies for session auth
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.error || `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    return { data };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

export { setCsrfToken, getCsrfToken };
