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
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || messages.length === 0) return;

    const threads = new Map<string, Message[]>();
    const userIds = new Set<string>();

    messages.forEach((m) => {
      const partnerId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      userIds.add(partnerId);
      const threadKey = `${partnerId}|${m.book_id || 'gen'}`;
      const threadMessages = threads.get(threadKey) || [];
      threads.set(threadKey, [...threadMessages, m]);
    });
    setChatThreads(threads);

    // Fetch profiles
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, email, name") // Assuming profiles table has these
        .in("id", Array.from(userIds));
      
      if (data) {
        const profilesMap: Record<string, { email: string; name: string }> = {};
        data.forEach(p => {
          profilesMap[p.id] = { email: p.email || "", name: p.name || "" };
        });
        setUserProfiles(profilesMap);
      }
    };
    fetchProfiles();
  }, [messages, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThread, messages]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

  const [partnerId, bookId] = selectedThread?.split('|') || [null, null];
  const activeMessages = selectedThread ? (chatThreads.get(selectedThread) || []) : [];

  const handleSend = async () => {
    if (!newMessage.trim() || !partnerId) return;
    try {
      // Ensure bookId is string or undefined
      const bId = (bookId && bookId !== 'gen') ? bookId : undefined;
      await sendMessage(partnerId, newMessage, bId);
      setNewMessage("");
    } catch (e) { console.error(e); }
  };

  const getDisplayName = (id: string) => {
    const profile = userProfiles[id];
    return profile ? (profile.name || profile.email) : id.slice(0, 8) + "...";
  };

  return (
    <div className="max-w-5xl mx-auto p-4 h-[80vh] flex bg-white rounded-xl shadow-md border overflow-hidden">
      {/* Threads */}
      <div className={`w-full md:w-80 border-r flex flex-col ${selectedThread ? 'hidden md:flex' : ''}`}>
        <div className="p-4 font-bold border-b">Chats</div>
        <ScrollArea className="flex-1">
          {Array.from(chatThreads.entries()).map(([key, msgs]) => {
            const [pId, bId] = key.split('|');
            return (
              <button key={key} onClick={() => setSelectedThread(key)} className={`w-full p-4 text-left border-b hover:bg-gray-50 ${selectedThread === key ? 'bg-primary/10' : ''}`}>
                <p className="font-semibold text-sm truncate">{getDisplayName(pId)}</p>
                <p className="text-xs text-gray-500 truncate">{bId !== 'gen' ? 'Book Chat' : 'General'}</p>
              </button>
            );
          })}
        </ScrollArea>
      </div>
      {/* Messages */}
      <div className={`flex-1 flex flex-col ${selectedThread ? 'flex' : 'hidden md:flex items-center justify-center'}`}>
        {selectedThread ? (
          <>
            <div className="p-3 border-b flex items-center">
              <Button variant="ghost" className="md:hidden" onClick={() => setSelectedThread(null)}><ChevronLeft/></Button>
              <h2 className="font-bold">{getDisplayName(partnerId || "")}</h2>
            </div>
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              {activeMessages.map(m => (
                <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"} mb-2`}>
                  <div className={`p-2 rounded-lg text-sm ${m.sender_id === user?.id ? "bg-primary text-white" : "bg-white border"}`}>{m.content}</div>
                </div>
              ))}
              <div ref={scrollRef} />
            </ScrollArea>
            <div className="p-3 border-t flex gap-2">
              <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type..." />
              <Button onClick={handleSend}><Send size={16}/></Button>
            </div>
          </>
        ) : <p className="text-gray-400">Select a chat</p>}
      </div>
    </div>
  );
}
