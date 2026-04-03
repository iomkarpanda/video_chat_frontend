"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import {
  fetchUserChatHistory,
  type UserSessionHistoryItem,
} from "@/lib/session-api";
import { AuthError } from "@/lib/auth-api";

const Page = () => {
  const { isLoggedIn, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [sessions, setSessions] = useState<UserSessionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, authLoading, router]);

  const handleAuthError = useCallback((err: unknown) => {
    if (err instanceof AuthError) {
      router.replace("/login");
      return true;
    }
    return false;
  }, [router]);

  useEffect(() => {
    async function loadHistory() {
      if (!isLoggedIn || authLoading) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetchUserChatHistory();
        setSessions(res.sessions || []);
      } catch (err) {
        if (handleAuthError(err)) return;
        const msg = err instanceof Error ? err.message : "Failed to load history";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [isLoggedIn, authLoading, handleAuthError]);

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
        <h1 className="text-xl font-semibold text-slate-900">Chat History</h1>

        {loading && (
          <p className="text-sm text-gray-600">Loading history...</p>
        )}

        {error && !loading && (
          <p className="text-sm text-red-600">Error: {error}</p>
        )}

        {!loading && !error && sessions.length === 0 && (
          <p className="text-sm text-gray-500">No chat history found.</p>
        )}

        {!loading && !error && sessions.length > 0 && (
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {sessions.map((session) => (
              <button
                key={session.session_uuid}
                type="button"
                onClick={() => router.push(`/chathistory/${session.session_uuid}`)}
                className="w-full text-left border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div className="text-sm text-slate-800 font-medium">
                    Session: {session.session_uuid}
                  </div>
                  <div className="text-xs text-slate-500">
                    Video ID: {session.video_id ?? "Unknown"}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Created at: {new Date(session.created_at).toLocaleString()}
                </div>
                {session.history.length > 0 && (
                  <div className="text-xs text-slate-600 truncate">
                    Last question: {session.history[session.history.length - 1].question}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
