import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { chatWithVideo, LlmProvider, fetchChatHistory } from '@/lib/video-chat-api';
import { AuthError } from '@/lib/auth-api';


type ChatProps = {
  videoId: string;
  transcriptReady: boolean;
  provider: LlmProvider;
  onProviderChange: (provider: LlmProvider) => void;
  providerDisabled?: boolean;
  onAuthExpired?: () => void;
};

  const Chat = ({
    videoId,
    transcriptReady,
    provider,
    onProviderChange,
    providerDisabled = false,
    onAuthExpired,
  }: ChatProps) => {
    const [userMessage, setUserMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<{ question: string; answer: string | null; created_at: string }[]>([]);
    const [liveMessages, setLiveMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const chatDivRef = useRef<HTMLDivElement>(null);

  async function sendMessage() {
    if (userMessage.trim() === "" || loading || !transcriptReady || !videoId) return;
    const userMsg = userMessage;
    appendLiveMessage({ role: 'user', content: userMsg });
    setUserMessage("");
    setLoading(true);
    try {
      const response = await chatWithVideo({
        video_id: videoId,
        query: userMsg,
        llm_provider: provider,
        n_results: 6,
      });
      const llmContent = response.data?.llm_response?.message?.content;
      appendLiveMessage({ role: 'assistant', content: llmContent || "[No response]" });
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        onAuthExpired?.();
        return;
      }
      const errorMessage = err instanceof Error ? err.message : "Error getting response from LLM";
      appendLiveMessage({ role: 'assistant', content: `[${errorMessage}]` });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadHistory() {
      if (!videoId || !transcriptReady) return;
      try {
        const res = await fetchChatHistory(videoId);
        if (Array.isArray(res.history) && res.history.length > 0) {
          setHistory(res.history);
          setLiveMessages([]);
        } else {
          setHistory([]);
          setLiveMessages([]);
        }
      } catch (err) {
        setHistory([]);
        setLiveMessages([]);
      }
    }
    loadHistory();
    // Reload if video, transcript readiness, or provider changes
  }, [videoId, transcriptReady, provider]);

  function appendLiveMessage(msg: { role: 'user' | 'assistant', content: string }) {
    setLiveMessages((prev) => {
      const next = [...prev, msg];
      // Prevent unbounded growth of messages in long chats
      const MAX_MESSAGES = 200;
      if (next.length > MAX_MESSAGES) {
        return next.slice(next.length - MAX_MESSAGES);
      }
      return next;
    });
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatDivRef.current) {
      chatDivRef.current.scrollTop = chatDivRef.current.scrollHeight;
    }
  }, [history, liveMessages]);

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chat-area w-full lg:w-1/2 max-w-130 min-h-120 bg-white rounded-lg shadow-lg p-4 flex flex-col">
      <div className="mb-3 flex items-center justify-between pb-2 border-b gap-2">
        <span className="text-sm text-gray-600">LLM Provider</span>
        <select
          value={provider}
          onChange={(e) => onProviderChange(e.target.value as LlmProvider)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          disabled={providerDisabled || loading}
        >
          <option value="gemini">Gemini</option>
          <option value="ollama">Ollama</option>
        </select>
      </div>
      <div className="flex-1 max-h-96 overflow-y-auto mb-2" ref={chatDivRef}>
        {history.length === 0 && liveMessages.length === 0 ? (
          <div className="text-gray-400 text-center mt-20 ">No messages yet.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.length > 0 && (
              <div className="mb-4">
                <div className="text-center text-xs text-gray-500 mb-1 font-semibold">Chat History</div>
                <div className="flex flex-col gap-1">
                  {history.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <div className="flex justify-end">
                        <div className="rounded-2xl px-4 py-2 max-w-[75%] wrap-break-word shadow-sm bg-black text-white rounded-br-sm opacity-80">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.question}</ReactMarkdown>
                        </div>
                      </div>
                      {item.answer && (
                        <div className="flex justify-start">
                          <div className="rounded-2xl px-4 py-2 max-w-[75%] wrap-break-word shadow-sm bg-gray-200 text-gray-900 rounded-bl-sm opacity-80">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.answer}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className="w-full border-t border-gray-300 my-2" />
              </div>
            )}
            {liveMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[75%] wrap-break-word shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-black text-white rounded-br-sm'
                      : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-center items-center gap-2">
        <Textarea
          placeholder={transcriptReady ? "Type a message..." : "Ingest a transcript first..."}
          className="h-10 w-full resize-none"
          style={{ height: '2.5rem', minHeight: '2.5rem', maxHeight: '2.5rem' }}
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={handleInputKeyDown}
          disabled={!transcriptReady}
        />
        <Button onClick={sendMessage} disabled={userMessage.trim() === "" || loading || !transcriptReady}>
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
};

export default Chat;