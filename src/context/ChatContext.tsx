"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import supabase from "@/lib/supabase";
import { useAuth } from "./AuthContext";

export interface Message {
  id: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  book_id: string | null;
  is_read: boolean;
  sender_name?: string; // Optional: for display
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (receiverId: string, content: string, bookId?: string) => Promise<void>;
  loading: boolean;
  activeChat: string | null; // receiverId
  setActiveChat: (receiverId: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data as Message[]);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMessages();

    // Set up real-time subscription
    if (user) {
      const subscription = supabase
        .channel("public:messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `sender_id=eq.${user.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `receiver_id=eq.${user.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
            // Optional: Show toast or notification
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user, fetchMessages]);

  const sendMessage = async (receiverId: string, content: string, bookId?: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        book_id: bookId || null,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        loading,
        activeChat,
        setActiveChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
