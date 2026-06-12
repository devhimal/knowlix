"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import BookCard from "@/components/BookCard";
import { useBooks } from "@/context/BookContext"; // New import

export default function BooksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { books } = useBooks(); // Use the BookContext

  const handleSearch = () => {
    // Implement search logic later
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Book Marketplace</h1>
        <p className="text-lg text-gray-600 mb-8">
          Buy, sell, or exchange academic books with other students.
        </p>

        <Card className="p-6 mb-8">
          <div className="flex gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for books by title, author, or subject..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
            <Button onClick={() => router.push("/books/list")} variant="outline">
              List Your Book
            </Button>
          </div>
        </Card>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">Books for Sale</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {books.filter((book) => book.type === "sell").map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              author={book.author}
              condition={book.condition || ""}
              price={book.price || 0}
              type={book.type || "sell"}
              seller_id={book.seller_id || undefined}
            />
          ))}
        </div>

        {/* Books for Exchange Section */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Books for Exchange</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.filter((book) => book.type === "exchange").map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              author={book.author}
              condition={book.condition || ""}
              price={book.price || 0}
              type={book.type || "exchange"}
              seller_id={book.seller_id || undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


