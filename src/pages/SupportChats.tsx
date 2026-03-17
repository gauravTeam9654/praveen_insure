import React, { useEffect, useState } from 'react';
import { MessageSquare, User as UserIcon, Calendar, Bot, Search } from 'lucide-react';
import { User } from '../types';

interface ChatLog {
  id: number;
  userId: number;
  userName: string;
  query: string;
  response: string;
  timestamp: string;
}

export default function SupportChats({ user }: { user: User }) {
  const [chats, setChats] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || ""}/api/chats?userId=${user.id}&role=${user.role}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch chats');
        return res.json();
      })
      .then(data => {
        setChats(Array.isArray(data) ? data.sort((a: ChatLog, b: ChatLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredChats = chats.filter(chat => 
    chat.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.query.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold">AI Support Logs</h2>
        <p className="text-muted">Monitor all AI chatbot interactions across the portal.</p>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <Search size={18} className="text-muted" />
            </span>
            <input 
              type="text" 
              className="form-control border-start-0 shadow-none" 
              placeholder="Search by user or query..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row g-4">
        {filteredChats.map((chat) => (
          <div key={chat.id} className="col-12">
            <div className="card border-0 shadow-sm overflow-hidden">
              <div className="card-header bg-light border-0 d-flex justify-content-between align-items-center py-3 px-4">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 p-2 rounded text-primary">
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <div className="fw-bold">{chat.userName}</div>
                    <div className="small text-muted">User ID: {chat.userId}</div>
                  </div>
                </div>
                <div className="text-muted small d-flex align-items-center gap-1">
                  <Calendar size={14} />
                  {new Date(chat.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="card-body p-4">
                <div className="mb-3">
                  <div className="text-muted small fw-bold text-uppercase mb-2 d-flex align-items-center gap-2">
                    <MessageSquare size={14} /> User Query
                  </div>
                  <div className="p-3 bg-light rounded-3 border-start border-primary border-4">
                    {chat.query}
                  </div>
                </div>
                <div>
                  <div className="text-muted small fw-bold text-uppercase mb-2 d-flex align-items-center gap-2">
                    <Bot size={14} className="text-primary" /> AI Response
                  </div>
                  <div className="p-3 bg-primary bg-opacity-10 rounded-3 border-start border-primary border-4">
                    {chat.response}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredChats.length === 0 && (
          <div className="col-12 text-center p-5 text-muted">
            <MessageSquare size={48} className="mb-3 opacity-25" />
            <p>No chat logs found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
