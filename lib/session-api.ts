import { getAccessToken } from "@/lib/auth-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

export type SessionChatHistoryItem = {
  question: string;
  answer: string | null;
  evidence_vectors: unknown;
  timestamp: string;
};

export type SessionHistoryResponse = {
  history: SessionChatHistoryItem[];
};

export type UserSessionHistoryItem = {
  session_uuid: string;
  video_id: string | null;
  created_at: string;
  history: SessionChatHistoryItem[];
};

export type UserHistoryResponse = {
  sessions: UserSessionHistoryItem[];
};

function buildAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = typeof window !== "undefined" ? getAccessToken() : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchUserChatHistory(): Promise<UserHistoryResponse> {
  const response = await fetch(`${API_BASE_URL}/session/history/user/`, {
    method: "GET",
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user chat history: ${response.status}`);
  }

  return (await response.json()) as UserHistoryResponse;
}

export async function fetchSessionChatHistory(
  sessionUuid: string
): Promise<SessionHistoryResponse> {
  const response = await fetch(
    `${API_BASE_URL}/session/history/${encodeURIComponent(sessionUuid)}/`,
    {
      method: "GET",
      headers: buildAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch session chat history: ${response.status}`);
  }

  return (await response.json()) as SessionHistoryResponse;
}
