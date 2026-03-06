
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';



const Chat = () => {
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<'ollama' | 'gemini'>('gemini');
  const chatDivRef = useRef<HTMLDivElement>(null);
  const backendUrl = "http://127.0.0.1:8000/llm/chat/";

  // Transcript ingest states
  const [videoId, setVideoId] = useState("");
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestResult, setIngestResult] = useState<string | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [transcriptReady, setTranscriptReady] = useState(false);

  // Helper to extract video ID from YouTube link or ID
  function extractVideoId(input: string): string | null {
    // Match standard, short, and embed URLs
    const patterns = [
      /(?:v=|\/embed\/|youtu\.be\/)([\w-]{11})/, // v=, /embed/, youtu.be
      /^([\w-]{11})$/ // plain ID
    ];
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  }

  async function handleIngestTranscript() {
    setIngestLoading(true);
    setIngestResult('Fetching transcript and processing...');
    setIngestError(null);
    setTranscriptReady(false);
    const extractedId = extractVideoId(videoId.trim());
    if (!extractedId) {
      setIngestError("Invalid YouTube link or video ID");
      setIngestLoading(false);
      setIngestResult(null);
      return;
    }
    try {
      const res = await fetch("http://127.0.0.1:8000/transcript/get/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: extractedId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch transcript and process");
      setIngestResult("Transcript fetched and processed successfully!");
      setTranscriptReady(true);
    } catch (err: any) {
      setIngestError(err.message || "Error sending request");
      setTranscriptReady(false);
      setIngestResult(null);
    } finally {
      setIngestLoading(false);
    }
  }

  async function sendMessage() {
    if (userMessage.trim() === "" || loading || !transcriptReady) return;
    const userMsg = userMessage;
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setUserMessage("");
    setLoading(true);
    try {
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          provider: provider,
          model: provider === 'gemini' ? 'models/gemini-2.5-flash' : 'llama2',
          collection_name: "transcript_embeddings",
          n_results: 6,
          distance_threshold: 0.6
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to get response");
      let llmContent = data.response;
      if (!llmContent && data.llm_response && data.llm_response.message && data.llm_response.message.content) {
        llmContent = data.llm_response.message.content;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: llmContent || "[No response]" }]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error getting response from LLM";
      setMessages((prev) => [...prev, { role: 'assistant', content: `[${errorMessage}]` }]);
    } finally {
      setLoading(false);
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatDivRef.current) {
      chatDivRef.current.scrollTop = chatDivRef.current.scrollHeight;
    }
  }, [messages]);

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chat-area w-full lg:w-1/2 max-w-130 min-h-120 bg-white rounded-lg shadow-lg p-4 flex flex-col">

      {/* Provider Selector */}
      <div className="mb-3 flex items-center gap-2 pb-2 border-b">
        <span className="text-sm font-medium text-gray-700">LLM Provider:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setProvider('gemini')}
            disabled={loading}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              provider === 'gemini'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Gemini
          </button>
          <button
            onClick={() => setProvider('ollama')}
            disabled={loading}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              provider === 'ollama'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ollama
          </button>
        </div>
      </div>

      {/* Status message for transcript fetching/processing */}
      {ingestLoading && (
        <div className="text-blue-500 text-center mb-2">{ingestResult || 'Fetching transcript and processing...'}</div>
      )}
      {ingestError && (
        <div className="text-red-500 text-center mb-2">{ingestError}</div>
      )}
      {ingestResult && !ingestLoading && !ingestError && (
        <div className="text-green-600 text-center mb-2">{ingestResult}</div>
      )}
      <div className="flex-1 max-h-96 overflow-y-auto mb-2" ref={chatDivRef}>
        {messages.length === 0 ? (
          <div className="text-gray-400 text-center mt-20 ">No messages yet.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((msg, idx) => (
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
                  {msg.content}
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