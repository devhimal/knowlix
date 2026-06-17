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
import { useAuth } from "./AuthContext";

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
  
  condition: string | null;
  price: number | null;
  type: "sell" | "exchange" | "free" | null;
  exchangeFor: string | null;
  seller_id: string | null; // Added seller_id
  average_rating?: number;
  total_ratings?: number;
  file_path?: string | null;
  cover_image_path?: string | null;
}

export interface DBBook {
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
  condition: string | null;
  price: number | null;
  type: "sell" | "exchange" | "free" | null;
  exchange_for: string | null;
  seller_id: string | null;
  average_rating?: number;
  total_ratings?: number;
  file_path?: string | null;
  cover_image_path?: string | null;
  status?: string;
}

interface BookContextType {
  books: Book[];
  fetchBooks: () => Promise<void>;
  addBook: (bookData: Omit<Book, "id" | "created_at" | "seller_id">) => Promise<Book | undefined>;
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
  const { user } = useAuth();

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("status", "approved");

      if (error) {
        throw error;
      }

      const mappedBooks: Book[] = (data as DBBook[]).map((dbBook) => ({
        ...dbBook,
        exchangeFor: dbBook.exchange_for,
      }));

      setBooks(mappedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addBook = useCallback(
    async (
      bookData: Omit<Book, "id" | "created_at" | "seller_id">,
    ): Promise<Book | undefined> => {
      try {
        if (!user) {
          throw new Error("You must be logged in to list a book");
        }

        const dataToInsert: Omit<DBBook, "id" | "created_at"> = {
          title: bookData.title,
          author: bookData.author,
          isbn: bookData.isbn,
          genre: bookData.genre,
          publication_year: bookData.publication_year,
          cover_image_url: bookData.cover_image_url,
          cover_image_path: bookData.cover_image_path,
          description: bookData.description,
          pages: bookData.pages,
          language: bookData.language,
          pdf_url: bookData.pdf_url,
          file_path: bookData.file_path,
          condition: bookData.condition,
          price: bookData.price,
          type: bookData.type,
          exchange_for: bookData.exchangeFor,
          seller_id: user.id,
          status: 'pending_review'
        };

        const { data, error } = await supabase.from("books").insert(dataToInsert).select();

        if (error) {
          throw error;
        }

        // Re-fetch books to update the context state
        fetchBooks();
        if (data && data[0]) {
          const dbBook = data[0] as DBBook;
          return {
            ...dbBook,
            exchangeFor: dbBook.exchange_for,
          };
        }
        return undefined;
      } catch (error) {
        console.error("Error adding book:", error);
        return undefined;
      }
    },
    [fetchBooks, user],
  );

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return (
    <BookContext.Provider
      value={{
        books,
        fetchBooks,
        addBook, 
        loading,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};
