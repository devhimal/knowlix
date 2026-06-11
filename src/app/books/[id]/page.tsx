"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // Import useParams
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BookCard from "@/components/BookCard"; // Import BookCard
import { useBooks } from "@/context/BookContext"; // Import useBooks

export default function BookDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : undefined;
  const { books, loading: booksLoading } = useBooks();
  const [book, setBook] = useState<any>(null);
  const [localLoading, setLocalLoading] = useState(true); // Use a local loading state

  useEffect(() => {
    console.log("BookDetailsPage - useEffect triggered.");
    console.log("Current ID from params (direct access):", id);
    console.log("Books from context:", books);

    if (id && !booksLoading) { // Only process if ID is present and books are not loading from context
      const foundBook = books.find((b: any) => b.id === id);
      if (foundBook) {
        setBook(foundBook);
      } else {
        setBook(null); // Book not found
      }
      setLocalLoading(false); // Local loading finished
    } else if (!id) {
      setLocalLoading(false); // No ID, so stop loading
    }
  }, [id, books, booksLoading]);

  if (localLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Loading Book Details...
            </h1>
            <p className="text-lg text-gray-700">
              Please wait while we fetch the book information.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Button onClick={() => router.back()} className="mb-4">
            &larr; Back to Books
          </Button>
          <Card className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Book Not Found
            </h1>
            <p className="text-lg text-gray-700">
              The book with ID "{id}" could not be found.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Button onClick={() => router.back()} className="mb-4">
          &larr; Back to Books
        </Button>
        <Card className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {book.title}
          </h1>
          <p className="text-lg text-gray-700 mb-2">
            <strong>Author:</strong> {book.author}
          </p>
          <p className="text-lg text-gray-700 mb-2">
            <strong>Condition:</strong> {book.condition}
          </p>
          {book.type === "sell" && (
            <p className="text-lg text-gray-700 mb-2">
              <strong>Price:</strong> NPR {book.price}
            </p>
          )}
          <p className="text-lg text-gray-700 mb-2">
            <strong>Type:</strong> {book.type}
          </p>
          {book.exchangeFor && (
            <p className="text-lg text-gray-700 mb-2">
              <strong>Exchange For:</strong> {book.exchangeFor}
            </p>
          )}
          <p className="text-lg text-gray-700 mb-2">
            <strong>Description:</strong> {book.description}
          </p>
          <div className="mt-6 flex gap-4">
            {book.type === "sell" ? (
              <>
                <Button onClick={() => alert("Buy this book now!")}>
                  Buy Now
                </Button>
                <Button variant="outline" onClick={() => alert("Contact seller for purchase details!")}>
                  Contact Seller
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => alert("Initiate exchange!")}>
                  Exchange Now
                </Button>
                <Button variant="outline" onClick={() => alert("Contact seller for exchange details!")}>
                  Contact Seller
                </Button>
              </>
            )}
          </div>
        </Card>

        <section className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Other Books You Might Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books
              .filter((b: any) => b.id !== id) // Filter out the current book
              .slice(0, 3) // Take up to 3 suggestions
              .map((suggestedBook: any) => (
                <BookCard
                  key={suggestedBook.id}
                  id={suggestedBook.id}
                  title={suggestedBook.title}
                  author={suggestedBook.author}
                  condition={suggestedBook.condition}
                  price={suggestedBook.price}
                  type={suggestedBook.type}
                  exchangeFor={suggestedBook.exchangeFor}
                  description={suggestedBook.description}
                />
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
