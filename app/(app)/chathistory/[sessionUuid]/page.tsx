"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { fetchSessionChatHistory, type SessionChatHistoryItem } from "@/lib/session-api";

const SessionHistoryPage = () => {
  const { isLoggedIn, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const sessionUuid = Array.isArray(params.sessionUuid)
    ? params.sessionUuid[0]
    : (params.sessionUuid as string | undefined);

  const [items, setItems] = useState<SessionChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, authLoading, router]);

  useEffect(() => {
    async function loadSessionHistory() {
      if (!isLoggedIn || authLoading || !sessionUuid) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetchSessionChatHistory(sessionUuid);
        setItems(res.history || []);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load session history";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadSessionHistory();
  }, [isLoggedIn, authLoading, sessionUuid]);

  if (!sessionUuid) {
    return (
      <div className="flex flex-col items-center justify-center w-full flex-1 bg-gray-50">
        <p className="text-gray-600 text-sm">Invalid session.</p>
      </div>
    );
  }

  if (authLoading || !isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center w-full flex-1 bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex justify-center items-start bg-gray-50 px-4 py-8">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-semibold text-slate-900">Session Details</h1>
          <button
            type="button"
            onClick={() => router.push("/chathistory")}
            className="text-xs text-blue-600 hover:underline"
          >
            Back to all sessions
          </button>
        </div>

        <p className="text-xs text-slate-500 break-all">Session ID: {sessionUuid}</p>

        {loading && (
          <p className="text-sm text-gray-600">Loading chats...</p>
        )}

        {error && !loading && (
          <p className="text-sm text-red-600">Error: {error}</p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-gray-500">No chats found for this session.</p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-end">
                  <div className="rounded-2xl px-3 py-2 max-w-[80%] bg-black text-white text-xs rounded-br-sm">
                    {item.question}
                  </div>
                </div>
                {item.answer && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-3 py-2 max-w-[80%] bg-gray-200 text-gray-900 text-xs rounded-bl-sm">
                      {item.answer}
                    </div>
                  </div>
                )}
                <div className="text-[10px] text-slate-400 text-right pr-1">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionHistoryPage;
