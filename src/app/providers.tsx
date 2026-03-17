"use client";

import { AuthProvider } from "@/context/AuthContext";
import { PaymentProvider } from "@/context/PaymentContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ResourceProvider } from "@/context/ResourceContext";
import { BookProvider } from "@/context/BookContext";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ResourceProvider>
          <PaymentProvider>
            <BookProvider>
              {children}
              <Toaster />
            </BookProvider>
          </PaymentProvider>
        </ResourceProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
