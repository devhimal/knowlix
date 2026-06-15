"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat, Message } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { Send } from "lucide-react";

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
  bookTitle?: string;
  bookId?: string;
}

export default function ChatDialog({
  isOpen,
  onClose,
  receiverId,
  receiverName,
  bookTitle,
  bookId,
}: ChatDialogProps) {
  const { messages, sendMessage } = useChat();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMessages = messages.filter(
    (m) => {
      const isCorrectConversation = 
        (m.sender_id === user?.id && m.receiver_id === receiverId) ||
        (m.sender_id === receiverId && m.receiver_id === user?.id);
      
      // If a bookId is provided, only show messages related to that book
      if (bookId) {
        return isCorrectConversation && m.book_id === bookId;
      }
      return isCorrectConversation;
    }
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await sendMessage(receiverId, newMessage, bookId);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chat with {receiverName}</DialogTitle>
          <DialogDescription className="sr-only">
            Send and receive messages with {receiverName} regarding {bookTitle || "a book listing"}.
          </DialogDescription>
          {bookTitle && (
            <p className="text-sm text-muted-foreground truncate">
              Regarding: {bookTitle}
            </p>
          )}
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {chatMessages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">
                No messages yet. Start the conversation!
              </p>
            ) : (
              chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.sender_id === user?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      m.sender_id === user?.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{m.content}</p>
                    <span className="text-[10px] opacity-70 block mt-1">
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        <DialogFooter className="mt-4">
          <div className="flex w-full gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button size="icon" onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
