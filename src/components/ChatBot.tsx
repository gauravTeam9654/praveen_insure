import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { User } from '../types';

export default function ChatBot({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `You are a helpful insurance assistant for the InsureClaim Portal. 
        The user's name is ${user.name}. 
        Answer their insurance related questions concisely.
        
        User Query: ${userQuery}`,
      });

      const botResponse = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);

      // Save to backend for admin review
      await fetch(`${import.meta.env.VITE_API_URL || ""}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          query: userQuery,
          response: botResponse
        })
      });

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting to my AI brain right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1050 }}>
      {isOpen ? (
        <div className="card shadow-lg border-0" style={{ width: '350px', height: '450px' }}>
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center gap-2">
              <Bot size={20} />
              <span className="fw-bold">InsureClaim AI</span>
            </div>
            <button className="btn btn-link text-white p-0" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div className="card-body overflow-auto p-3" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="text-center text-muted mt-5">
                <Bot size={40} className="mb-2 opacity-25" />
                <p>Hello {user.name}! How can I help you with your insurance claims today?</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                <div className={`d-flex gap-2 max-w-75 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`rounded-circle p-1 flex-shrink-0 d-flex align-items-center justify-content-center bg-light`} style={{ width: '28px', height: '28px' }}>
                    {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} className="text-primary" />}
                  </div>
                  <div className={`p-2 rounded-3 small ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-light'}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="d-flex mb-3 justify-content-start">
                <div className="d-flex gap-2">
                  <div className="rounded-circle p-1 flex-shrink-0 d-flex align-items-center justify-content-center bg-light" style={{ width: '28px', height: '28px' }}>
                    <Bot size={16} className="text-primary" />
                  </div>
                  <div className="p-2 rounded-3 bg-light">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-footer bg-white border-top p-2">
            <div className="input-group">
              <input 
                type="text" 
                className="form-control border-0 shadow-none" 
                placeholder="Type your message..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button className="btn btn-primary rounded-3 px-3" onClick={handleSend} disabled={loading}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          className="btn btn-primary rounded-circle shadow-lg p-3 d-flex align-items-center justify-content-center"
          style={{ width: '60px', height: '60px' }}
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare size={28} />
        </button>
      )}
    </div>
  );
}
