/**
 * Auth API integration per Frontend Integration Guide.
 * Base URL: http://localhost:8000/auth/
 */

const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

const ACCESS_TOKEN_KEY = "auth_access_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";

// In-memory access token (preferred for SPAs per guide)
let accessToken: string | null = null;

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  const storage = getStorage();
  if (storage) {
    const stored = storage.getItem(ACCESS_TOKEN_KEY);
    if (stored) {
      accessToken = stored;
      return stored;
    }
  }
  return null;
}

export function getRefreshToken(): string | null {
  const storage = getStorage();
  return storage?.getItem(REFRESH_TOKEN_KEY) ?? null;
}

export function setTokens(token: string, refresh: string): void {
  accessToken = token;
  const storage = getStorage();
  if (storage) {
    storage.setItem(ACCESS_TOKEN_KEY, token);
    storage.setItem(REFRESH_TOKEN_KEY, refresh);
  }
}

export function clearTokens(): void {
  accessToken = null;
  const storage = getStorage();
  if (storage) {
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// --- API types ---

export type RegisterRequest = {
  email: string;
  password: string;
};

export type RegisterResponse = {
  message: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  refresh: string;
};

export type LogoutRequest = {
  refresh: string;
};

export type LogoutResponse = {
  message: string;
};

export type ChangePasswordRequest = {
  email: string;
  current_password: string;
  new_password: string;
};

export type ChangePasswordResponse = {
  message?: string;
};

type AuthErrorResponse = {
  error?: string;
};

async function authFetch<T>(
  path: string,
  options: RequestInit & { body?: Record<string, unknown> }
): Promise<T> {
  const { body, ...rest } = options;
  const url = `${AUTH_BASE_URL}/auth${path}`;
  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = (await res.json()) as T & AuthErrorResponse;

  if (!res.ok) {
    throw new Error(payload.error || `Request failed with status ${res.status}`);
  }

  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return authFetch<RegisterResponse>("/register/", {
    method: "POST",
    body: data,
  });
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return authFetch<LoginResponse>("/login/", {
    method: "POST",
    body: data,
  });
}

export async function logout(): Promise<LogoutResponse> {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearTokens();
    return { message: "Logout successful" };
  }
  try {
    const res = await authFetch<LogoutResponse>("/logout/", {
      method: "POST",
      body: { refresh },
    });
    return res;
  } finally {
    clearTokens();
  }
}

export async function changePassword(
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  return authFetch<ChangePasswordResponse>("/change-password/", {
    method: "POST",
    body: data,
  });
}
