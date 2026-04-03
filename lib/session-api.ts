import { fetchWithAuth } from "@/lib/auth-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "https://video-chat-backend-ddbg.onrender.com"  || "http://localhost:8000";

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

export async function fetchUserChatHistory(): Promise<UserHistoryResponse> {
  return fetchWithAuth<UserHistoryResponse>(
    `${API_BASE_URL}/session/history/user/`,
    { method: "GET" }
  );
}

export async function fetchSessionChatHistory(
  sessionUuid: string
): Promise<SessionHistoryResponse> {
  return fetchWithAuth<SessionHistoryResponse>(
    `${API_BASE_URL}/session/history/${encodeURIComponent(sessionUuid)}/`,
    { method: "GET" }
  );
}
