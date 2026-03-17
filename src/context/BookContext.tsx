"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext'; // Assuming AuthContext provides user info

export interface Book {
  id: string;
  title: string;
  author: string;
  condition: "new" | "used-like-new" | "used-good" | "used-fair";
  type: "sell" | "exchange" | "free"; // sell, exchange, free
  price?: number; // Only if type is 'sell'
  exchangeFor?: string; // Only if type is 'exchange'
  description?: string;
  sellerId: string;
  sellerName: string;
  postedDate: string;
}

interface BookContextType {
  books: Book[];
  addBook: (newBook: Omit<Book, 'id' | 'sellerId' | 'sellerName' | 'postedDate'>) => void;
  getBooks: () => Book[];
  getUsersBooks: (userId: string) => Book[];
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([
    // Dummy data for initial display
    {
      id: "b1",
      title: "Calculus I",
      author: "James Stewart",
      condition: "used-good",
      type: "sell",
      price: 500,
      description: "8th edition, some highlights",
      sellerId: "user1",
      sellerName: "Alice",
      postedDate: "2023-01-15",
    },
    {
      id: "b2",
      title: "Linear Algebra",
      author: "Gilbert Strang",
      condition: "used-fair",
      type: "exchange",
      exchangeFor: "Differential Equations book",
      sellerId: "user2",
      sellerName: "Bob",
      postedDate: "2023-02-01",
    },
    {
      id: "b3",
      title: "Data Structures and Algorithms",
      author: "Thomas Cormen",
      condition: "new",
      type: "sell",
      price: 800,
      sellerId: "user1",
      sellerName: "Alice",
      postedDate: "2023-03-10",
    },
    {
      id: "b4",
      title: "Operating System Concepts",
      author: "Silberschatz",
      condition: "used-good",
      type: "free",
      description: "7th edition, some wear and tear",
      sellerId: "user3",
      sellerName: "Charlie",
      postedDate: "2023-03-20",
    },
  ]);

  const addBook = (newBookData: Omit<Book, 'id' | 'sellerId' | 'sellerName' | 'postedDate'>) => {
    if (!user) {
      console.error("User not authenticated to add book.");
      return;
    }

    const newBook: Book = {
      ...newBookData,
      id: `book-${books.length + 1}-${Date.now()}`,
      sellerId: user.id,
      sellerName: user.name,
      postedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    };
    setBooks((prevBooks) => [...prevBooks, newBook]);
  };

  const getBooks = () => books;

  const getUsersBooks = (userId: string) => {
    return books.filter((book) => book.sellerId === userId);
  };

  return (
    <BookContext.Provider value={{ books, addBook, getBooks, getUsersBooks }}>
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
}
