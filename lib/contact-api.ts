import { BasicApiResponse } from "@/lib/auth-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "https://video-chat-backend-ddbg.onrender.com" || "http://localhost:8000";

export type ContactRequest = {
  full_name: string;
  email: string;
  phone?: string;
  comment: string;
};

export type ContactResponse = BasicApiResponse;

export async function submitContact(data: ContactRequest): Promise<ContactResponse> {
  const url = `${API_BASE_URL}/contact/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  let payload: ContactResponse | null = null;
  try {
    payload = (await res.json()) as ContactResponse;
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const baseMessage =
      (payload && (payload as any).error) ||
      (res.status === 429
        ? "Rate limit exceeded, please try again later."
        : `Request failed with status ${res.status}`);
    throw new Error(baseMessage);
  }

  return (
    payload || {
      message: "Contact form submitted successfully",
    }
  );
}
