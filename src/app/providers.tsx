"use client";

import { AuthProvider } from "@/context/AuthContext";
import { PaymentProvider } from "@/context/PaymentContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ResourceProvider } from "@/context/ResourceContext";
import { BookProvider } from "@/context/BookContext";
import { MentorProvider } from "@/context/MentorContext"; // Import MentorProvider
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ResourceProvider>
          <MentorProvider> {/* Add MentorProvider here */}
            <PaymentProvider>
              <BookProvider>
                {children}
                <Toaster />
              </BookProvider>
            </PaymentProvider>
          </MentorProvider>
        </ResourceProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
