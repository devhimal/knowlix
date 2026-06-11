"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import supabase from "@/lib/supabase"; // Client-side Supabase client

export interface Book {
  id: string;
  created_at: string;
  title: string;
  author: string;
  isbn: string | null;
  genre: string | null;
  publication_year: number | null;
  cover_image_url: string | null;
  description: string | null;
  pages: number | null;
  language: string | null;
  pdf_url: string | null;
  // New properties for market functionality
  condition: string | null;
  price: number | null;
  type: "sell" | "exchange" | "free" | null;
  exchangeFor: string | null;
}

interface BookContextType {
  books: Book[];
  fetchBooks: () => Promise<void>;
  addBook: (bookData: Omit<Book, "id" | "created_at">) => Promise<Book | undefined>;
  loading: boolean;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBooks must be used within a BookProvider");
  }
  return context;
};

export const BookProvider = ({ children }: { children: ReactNode }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("books").select("*");

      if (error) {
        throw error;
      }
      setBooks(data as Book[]);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addBook = useCallback(
    async (bookData: Omit<Book, "id" | "created_at">): Promise<Book | undefined> => {
      try {
        const {
          coverImageUrl,
          publicationYear,
          exchangeFor,
          pdfUrl,
          ...rest
        } = bookData;

        const dataToInsert = {
          ...rest,
          cover_image_url: coverImageUrl,
          publication_year: publicationYear,
          exchange_for: exchangeFor,
          pdf_url: pdfUrl,
        };

        const { data, error } = await supabase.from("books").insert(dataToInsert).select();

        if (error) {
          throw error;
        }

        // Re-fetch books to update the context state with the new book and its auto-generated ID/created_at
        fetchBooks();
        return data ? (data[0] as Book) : undefined;
      } catch (error) {
        console.error("Error adding book:", error);
        return undefined;
      }
    },
    [fetchBooks],
  );

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return (
    <BookContext.Provider
      value={{
        books,
        fetchBooks,
        addBook, // Expose addBook
        loading,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};
