"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ChatDialog from "./ChatDialog";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  condition: string;
  price?: number;
  type: "sell" | "exchange" | "free";
  seller_id?: string;
}

export default function BookCard({ id, title, author, condition, price, type, seller_id }: BookCardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleActionClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login to contact the seller");
      router.push("/login");
      return;
    }
    
    if (user?.id === seller_id) {
      toast.error("You cannot buy/exchange your own book");
      return;
    }

    setShowContact(true);
  };

  const handleContactClick = () => {
    if (!seller_id) {
      toast.error("Seller information not available");
      return;
    }
    setIsChatOpen(true);
  };

  return (
    <>
      <Card className="p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-gray-600 text-sm mb-2">by {author}</p>
          <p className="text-gray-700 text-md">Condition: {condition}</p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          {type === "sell" && !showContact && (
            <span className="text-xl font-bold text-primary">NPR {price}</span>
          )}
          {showContact ? (
            <Button size="sm" onClick={handleContactClick}>Contact Seller</Button>
          ) : type === "sell" ? (
            <Button size="sm" onClick={handleActionClick}>Buy Now</Button>
          ) : (
            <Button size="sm" onClick={handleActionClick}>Exchange Now</Button>
          )}
          <Button size="sm" variant="outline" onClick={() => router.push(`/books/${id}`)}>View Details</Button>
        </div>
      </Card>

      {seller_id && (
        <ChatDialog
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          receiverId={seller_id}
          receiverName="Seller" // We could fetch actual name if needed
          bookTitle={title}
          bookId={id}
        />
      )}
    </>
  );
}