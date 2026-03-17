"use client";

import { useState } from "react"; // Import useState
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Import useRouter

export default function BookCard({ id, title, author, condition, price, type }: any) {
  const router = useRouter();
  const [showContact, setShowContact] = useState(false); // State to control contact button visibility

  console.log(`BookCard for ${title} (ID: ${id}) received type: ${type}`); // Add console log

  const handleActionClick = () => {
    setShowContact(true);
    console.log(`Action clicked for book ID: ${id}, type: ${type}`);
  };

  const handleContactClick = () => {
    console.log(`Contact seller for book ID: ${id}, type: ${type}`);
    // Implement actual contact logic here (e.g., open a modal, navigate to chat)
    alert(`Contacting seller for "${title}" (${type})`);
  };

  return (
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
  );
}