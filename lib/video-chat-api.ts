import { getAccessToken } from "@/lib/auth-api";

export type LlmProvider = "gemini" | "ollama";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

type ApiErrorResponse = {
  error?: string;
};

type LlmResponse = {
  message?: {
    content?: string;
  };
};

export type ProcessVideoRequest = {
  source_url: string;
  source_type?: "transcript" | "audio";
  classify?: boolean;
  query?: string;
  n_results?: number;
  llm_provider?: LlmProvider;
  model?: string;
};

export type ProcessVideoResponse = {
  status: string;
  data: {
    status?: string;
    video_id?: string;
    message?: string;
    llm_response?: LlmResponse;
    [key: string]: unknown;
  };
  message?: string;
};

export type ChatWithVideoRequest = {
  video_id: string;
  query: string;
  n_results?: number;
  llm_provider?: LlmProvider;
  model?: string;
};

export type ChatWithVideoResponse = {
  status: string;
  data: {
    video_id?: string;
    query?: string;
    llm_response?: LlmResponse;
    [key: string]: unknown;
  };
  message?: string;
};

export type HealthResponse = {
  status: string;
  message: string;
};

export type ChatHistoryItem = {
  question: string;
  answer: string | null;
  created_at: string;
};

export type ChatHistoryResponse = {
  history: ChatHistoryItem[];
};

export async function fetchChatHistory(video_id: string): Promise<ChatHistoryResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = typeof window !== "undefined" ? getAccessToken() : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Use the dedicated chathistory endpoint while keeping query semantics the same.
  const url = `${API_BASE_URL}/transcript/chathistory/?video_id=${encodeURIComponent(video_id)}`;
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch chat history: ${response.status}`);
  }
  return response.json() as Promise<ChatHistoryResponse>;
}

async function postJson<TResponse>(
  path: string,
  body: Record<string, unknown>
): Promise<TResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = typeof window !== "undefined" ? getAccessToken() : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as TResponse & ApiErrorResponse;

  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload;
}

export async function processVideo(
  request: ProcessVideoRequest
): Promise<ProcessVideoResponse> {
  return postJson<ProcessVideoResponse>("/transcript/process/", request);
}

export async function chatWithVideo(
  request: ChatWithVideoRequest
): Promise<ChatWithVideoResponse> {
  return postJson<ChatWithVideoResponse>("/transcript/chat/", request);
}

export async function healthCheck(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/transcript/health/`);
  const payload = (await response.json()) as HealthResponse & ApiErrorResponse;

  if (!response.ok) {
    throw new Error(payload.error || `Health check failed with status ${response.status}`);
  }

  return payload;
}

export function extractYouTubeVideoId(input: string): string | null {
  const value = input.trim();

  if (!value) {
    return null;
  }

  // Already an ID.
  if (/^[\w-]{11}$/.test(value)) {
    return value;
  }

  // Try robust URL parsing first.
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const v = parsed.searchParams.get("v");
      if (v) {
        return extractYouTubeVideoId(v);
      }

      const embedMatch = parsed.pathname.match(/\/embed\/([\w-]{11})/);
      if (embedMatch?.[1]) {
        return embedMatch[1];
      }
    }

    if (host === "youtu.be") {
      const shortId = parsed.pathname.split("/").filter(Boolean)[0];
      if (shortId && /^[\w-]{11}$/.test(shortId)) {
        return shortId;
      }
    }
  } catch {
    // Fall through to regex parsing for non-URL input.
  }

  const patterns = [
    /(?:v=|\/embed\/|youtu\.be\/)([\w-]{11})/,
    /^([\w-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}
