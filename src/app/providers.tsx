"use client";

import { AuthProvider } from "@/context/AuthContext";
import { PaymentProvider } from "@/context/PaymentContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ResourceProvider } from "@/context/ResourceContext";
import { BookProvider } from "@/context/BookContext";
import { ChatProvider } from "@/context/ChatContext";
import { MentorProvider } from "@/context/MentorContext"; // Import MentorProvider
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ResourceProvider>
          <MentorProvider> {}
            <PaymentProvider>
              <BookProvider>
                <ChatProvider>
                  {children}
                  <Toaster />
                </ChatProvider>
              </BookProvider>
            </PaymentProvider>
          </MentorProvider>
        </ResourceProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
