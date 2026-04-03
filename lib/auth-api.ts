/**
 * Auth API integration with HTTP-only cookie-based JWT auth.
 *
 * Tokens are stored in HTTP-only, secure, SameSite=None cookies set by the backend.
 * The browser automatically sends cookies with requests (credentials: 'include').
 * On 401, the access token is automatically refreshed using the refresh cookie.
 * If refresh fails, an AuthError is thrown and the UI should redirect to login.
 */

const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "https://video-chat-backend-ddbg.onrender.com" ||"http://localhost:8000";

let authenticated = false;

type AuthChangeListener = (isAuthenticated: boolean) => void;
const authChangeListeners = new Set<AuthChangeListener>();

export function onAuthChange(listener: AuthChangeListener): () => void {
  authChangeListeners.add(listener);
  return () => {
    authChangeListeners.delete(listener);
  };
}

function notifyAuthChange(isAuth: boolean) {
  if (authenticated !== isAuth) {
    authenticated = isAuth;
    authChangeListeners.forEach((fn) => fn(isAuth));
  }
}

export function setAuthenticated(isAuth: boolean): void {
  notifyAuthChange(isAuth);
}

export function isAuthenticated(): boolean {
  return authenticated;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

const credentials: RequestCredentials = "include";

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

async function authFetch<T>(
  path: string,
  options: JsonRequestInit
): Promise<T> {
  const { body, ...rest } = options;
  const url = `${AUTH_BASE_URL}/auth${path}`;
  const res = await fetch(url, {
    ...rest,
    credentials,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await parseJsonSafe<T & { error?: string }>(res);

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

export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retryRes = await fetch(url, {
        ...options,
        credentials,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
      if (retryRes.status === 401) {
        notifyAuthChange(false);
        throw new AuthError("Session expired. Please log in again.");
      }
      const payload = await parseJsonSafe<T & { error?: string }>(retryRes);
      if (!retryRes.ok) {
        const message =
          (payload as any)?.error || `Request failed with status ${retryRes.status}`;
        throw new Error(message);
      }
      return payload as T;
    } else {
      notifyAuthChange(false);
      throw new AuthError("Session expired. Please log in again.");
    }
  }

  const payload = await parseJsonSafe<T & { error?: string }>(res);

  if (!res.ok) {
    const message =
      (payload as any)?.error ||
      (res.status === 429
        ? "Rate limit exceeded, please try again later."
        : `Request failed with status ${res.status}`);
    throw new Error(message);
  }

  if (!payload) {
    throw new Error("Unexpected empty response from server");
  }

  if ((payload as any).error) {
    throw new Error((payload as any).error);
  }

  return payload as T;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${AUTH_BASE_URL}/auth/refresh/`, {
      method: "POST",
      credentials,
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      notifyAuthChange(false);
      return false;
    }

    notifyAuthChange(true);
    return true;
  } catch {
    notifyAuthChange(false);
    return false;
  }
}

// --- API types ---

export type RegisterRequest = {
  email: string;
  password: string;
  password_confirm: string;
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

export type BasicApiResponse = {
  message?: string;
  error?: string;
};

// --- Auth endpoints ---

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const result = await authFetch<RegisterResponse>("/register/", {
    method: "POST",
    body: data,
  });
  notifyAuthChange(true);
  return result;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const result = await authFetch<LoginResponse>("/login/", {
    method: "POST",
    body: data,
  });
  notifyAuthChange(true);
  return result;
}

export async function logout(): Promise<LogoutResponse> {
  try {
    await authFetch<LogoutResponse>("/logout/", {
      method: "POST",
    });
  } catch {
    // ignore logout errors
  } finally {
    notifyAuthChange(false);
  }
  return { message: "Logout successful" };
}

export async function changePassword(
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  return authFetch<ChangePasswordResponse>("/change-password/", {
    method: "POST",
    body: data,
  });
}
