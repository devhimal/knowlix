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
  const { user, loading: authLoading } = useAuth();

  const fetchMessages = useCallback(async () => {
    if (!user || authLoading) {
      console.log("fetchMessages skipped: user is null or auth is loading", { userId: user?.id, authLoading });
      return;
    }
    console.log("Fetching messages for user:", user.id);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Supabase error fetching messages:", error);
        console.log("Error keys:", Object.keys(error));
        console.log("Error own property names:", Object.getOwnPropertyNames(error));
        console.log("Error stringified:", JSON.stringify(error, null, 2));
        throw error;
      }
      setMessages(data as Message[]);
    } catch (error: any) {
      console.error("Detailed error in fetchMessages catch block:", error);
      console.log("Catch error keys:", Object.keys(error));
      console.log("Catch error own property names:", Object.getOwnPropertyNames(error));
      console.log("Catch error stringified:", JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      fetchMessages();
    }

    // Set up real-time subscription
    if (user && !authLoading) {
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
  }, [user, authLoading, fetchMessages]);

  const sendMessage = async (receiverId: string, content: string, bookId?: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        book_id: bookId || null,
      });

      if (error) {
        console.error("Supabase error sending message:", error.message, error.details);
        throw error;
      }
    } catch (error: any) {
      console.error("Error in sendMessage:", error.message || error);
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
