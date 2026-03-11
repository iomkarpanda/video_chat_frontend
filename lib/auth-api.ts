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

// Shared shape for simple success responses
export type BasicApiResponse = {
  message?: string;
} & AuthErrorResponse;

type RefreshTokenResponse = {
  token?: string; // backend may use `token`
  access?: string; // or `access` for JWT
  refresh?: string;
  message?: string;
} & AuthErrorResponse;

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  const storage = getStorage();
  if (!refresh || !storage) {
    clearTokens();
    return false;
  }

  try {
    const res = await fetch(`${AUTH_BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    let payload: RefreshTokenResponse | null = null;
    try {
      payload = (await res.json()) as RefreshTokenResponse;
    } catch {
      // If we cannot parse JSON, treat as failure.
      clearTokens();
      return false;
    }

    if (!res.ok || payload.error) {
      clearTokens();
      return false;
    }

    const newAccess = payload.token || payload.access;
    const newRefresh = payload.refresh || refresh;

    if (!newAccess) {
      clearTokens();
      return false;
    }

    setTokens(newAccess, newRefresh);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
 
type JsonRequestInit = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function fetchWithAuthRetry<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const maxNetworkRetries = 1;

  const doFetch = async (): Promise<Response> => {
    const token = getAccessToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  };

  let res: Response | null = null;

  for (let attempt = 0; attempt <= maxNetworkRetries; attempt++) {
    try {
      res = await doFetch();
      break;
    } catch (err) {
      if (attempt === maxNetworkRetries) {
        throw new Error(
          err instanceof Error ? err.message : "Network error while calling API"
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  if (!res) {
    throw new Error("No response from server");
  }

  // Attempt token refresh once on 401
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await doFetch();
    }
  }

  const payload = await parseJsonSafe<T & AuthErrorResponse>(res);

  if (!res.ok) {
    const baseMessage =
      payload?.error ||
      (res.status === 429
        ? "Rate limit exceeded, please try again later."
        : `Request failed with status ${res.status}`);
    throw new Error(baseMessage);
  }

  if (!payload) {
    throw new Error("Unexpected empty response from server");
  }

  if ((payload as AuthErrorResponse).error) {
    throw new Error((payload as AuthErrorResponse).error as string);
  }

  return payload as T;
}

async function authFetch<T>(
  path: string,
  options: JsonRequestInit
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

  const payload = await parseJsonSafe<T & AuthErrorResponse>(res);

  if (!res.ok) {
    const message =
      payload?.error ||
      (res.status === 429
        ? "Rate limit exceeded, please try again later."
        : `Request failed with status ${res.status}`);
    throw new Error(message);
  }

  if (!payload) {
    throw new Error("Unexpected empty response from server");
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
