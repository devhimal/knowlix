"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChat, Message } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquare, Send, ChevronLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import supabase from "@/lib/supabase";

export default function ChatsPage() {
  const { messages, loading, sendMessage } = useChat();
  const { user } = useAuth();
  const [chatThreads, setChatThreads] = useState<Map<string, Message[]>>(new Map());
  const [userProfiles, setUserProfiles] = useState<Record<string, { email: string; name: string }>>({});
  const [bookDetails, setBookDetails] = useState<Record<string, { title: string }>>({});
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || messages.length === 0) return;

    const threads = new Map<string, Message[]>();
    const userIds = new Set<string>();
    const bookIds = new Set<string>();

    messages.forEach((m) => {
      const partnerId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      userIds.add(partnerId);
      if (m.book_id) bookIds.add(m.book_id);
      
      const threadKey = `${partnerId}|${m.book_id || 'gen'}`;
      const threadMessages = threads.get(threadKey) || [];
      threads.set(threadKey, [...threadMessages, m]);
    });
    setChatThreads(threads);

    // Fetch profiles
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, email, name")
        .in("id", Array.from(userIds));
      
      if (data) {
        const profilesMap: Record<string, { email: string; name: string }> = {};
        data.forEach(p => {
          profilesMap[p.id] = { email: p.email || "", name: p.name || "" };
        });
        setUserProfiles(profilesMap);
      }
    };

    // Fetch books
    const fetchBooks = async () => {
      if (bookIds.size === 0) return;
      const { data } = await supabase
        .from("books")
        .select("id, title")
        .in("id", Array.from(bookIds));
      
      if (data) {
        const booksMap: Record<string, { title: string }> = {};
        data.forEach(b => {
          booksMap[b.id] = { title: b.title };
        });
        setBookDetails(booksMap);
      }
    };

    fetchProfiles();
    fetchBooks();
  }, [messages, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThread, messages]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

  const [partnerId, threadBookId] = selectedThread?.split('|') || [null, null];
  const activeMessages = selectedThread ? (chatThreads.get(selectedThread) || []) : [];

  const handleSend = async () => {
    if (!newMessage.trim() || !partnerId) return;
    try {
      const bId = (threadBookId && threadBookId !== 'gen') ? threadBookId : undefined;
      await sendMessage(partnerId, newMessage, bId);
      setNewMessage("");
    } catch (e) { console.error(e); }
  };

  const getDisplayName = (id: string) => {
    const profile = userProfiles[id];
    return profile ? (profile.name || profile.email || "User") : "User (" + id.slice(0, 4) + ")";
  };

  const getBookTitle = (id: string) => {
    return bookDetails[id]?.title || "Book Discussion";
  };

  return (
    <div className="max-w-6xl mx-auto p-4 h-[85vh] flex bg-white rounded-2xl shadow-lg border overflow-hidden mt-6">
      {/* Threads */}
      <div className={`w-full md:w-96 border-r flex flex-col ${selectedThread ? 'hidden md:flex' : ''}`}>
        <div className="p-6 font-bold text-xl border-b flex items-center gap-2">
          <MessageSquare className="text-primary" />
          Messages
        </div>
        <ScrollArea className="flex-1">
          {Array.from(chatThreads.entries()).map(([key, msgs]) => {
            const [pId, bId] = key.split('|');
            const lastMsg = msgs[msgs.length - 1];
            return (
              <button 
                key={key} 
                onClick={() => setSelectedThread(key)} 
                className={`w-full p-4 text-left border-b transition-colors hover:bg-gray-50 ${selectedThread === key ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-gray-900 truncate">{getDisplayName(pId)}</p>
                  <span className="text-[10px] text-gray-400">
                    {new Date(lastMsg.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs font-medium text-primary mb-1 truncate">
                  {bId !== 'gen' ? `📙 ${getBookTitle(bId)}` : '💬 General Chat'}
                </p>
                <p className="text-xs text-gray-500 truncate italic">"{lastMsg.content}"</p>
              </button>
            );
          })}
          {chatThreads.size === 0 && (
            <div className="p-10 text-center text-gray-400">
              <MessageSquare className="mx-auto h-12 w-12 opacity-20 mb-4" />
              <p>No conversations yet.</p>
            </div>
          )}
        </ScrollArea>
      </div>
      {/* Messages */}
      <div className={`flex-1 flex flex-col ${selectedThread ? 'flex' : 'hidden md:flex items-center justify-center bg-gray-50'}`}>
        {selectedThread ? (
          <>
            <div className="p-4 border-b flex items-center justify-between bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedThread(null)}><ChevronLeft/></Button>
                <div>
                  <h2 className="font-bold text-gray-900">{getDisplayName(partnerId || "")}</h2>
                  <p className="text-xs text-primary font-medium">
                    {threadBookId !== 'gen' ? `Regarding: ${getBookTitle(threadBookId || "")}` : 'General Discussion'}
                  </p>
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1 p-6 bg-gray-50/50">
              <div className="space-y-4">
                {activeMessages.map(m => (
                  <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] shadow-sm ${m.sender_id === user?.id ? "bg-primary text-white rounded-2xl rounded-tr-none p-3" : "bg-white border rounded-2xl rounded-tl-none p-3"}`}>
                      <p className="text-sm leading-relaxed">{m.content}</p>
                      <span className={`text-[9px] block mt-1 ${m.sender_id === user?.id ? "text-white/70" : "text-gray-400"}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2 bg-gray-100 p-2 rounded-xl">
                <Input 
                  value={newMessage} 
                  onChange={e => setNewMessage(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSend()} 
                  placeholder="Type a message..." 
                  className="bg-transparent border-none focus-visible:ring-0"
                />
                <Button onClick={handleSend} className="rounded-lg shadow-md"><Send size={18}/></Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center max-w-sm">
            <div className="bg-white p-8 rounded-full shadow-inner mb-6 mx-auto w-32 h-32 flex items-center justify-center">
              <MessageSquare className="h-16 w-16 text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Your Conversations</h3>
            <p className="text-gray-500">Select a chat thread from the left to view messages and continue your discussion.</p>
          </div>
        )}
      </div>
    </div>
  );
}
