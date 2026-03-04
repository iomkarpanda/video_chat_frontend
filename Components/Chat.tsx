
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';


const Chat = () => {
  const [userMessage, setUserMessage] = useState("");
  // messages: { role: 'user' | 'assistant', content: string }
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const chatDivRef = useRef<HTMLDivElement>(null);


  async function sendMessage() {
    if (userMessage.trim() === "" || loading) return;
    const userMsg = userMessage;
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setUserMessage("");
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/llm/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, model: "llama2" })
      });
      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();
      // Try to get the response from data.response or data.ollama_response.message.content
      let llmContent = data.response;
      if (!llmContent && data.ollama_response && data.ollama_response.message && data.ollama_response.message.content) {
        llmContent = data.ollama_response.message.content;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: llmContent || "[No response]" }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: "[Error getting response from LLM]" }]);
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
          placeholder="Type a message..."
          className="h-10 w-full resize-none"
          style={{ height: '2.5rem', minHeight: '2.5rem', maxHeight: '2.5rem' }}
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={handleInputKeyDown}
        />
        <Button onClick={sendMessage} disabled={userMessage.trim() === "" || loading}>
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
};

export default Chat;