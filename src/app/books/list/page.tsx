"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner"; // Assuming sonner is available
import { useBooks, Book } from "@/context/BookContext"; // New import

interface BookFormData {
  title: string;
  author: string;
  isbn: string | null; // Added missing property
  genre: string | null; // Added missing property
  publication_year: number | null; // Added missing property
  cover_image_url: string | null; // Added missing property
  pages: number | null; // Added missing property
  language: string | null; // Added missing property
  pdf_url: string | null; // Added missing property
  condition: "new" | "used-like-new" | "used-good" | "used-fair" | "";
  type: "sell" | "exchange" | "free";
  price: number;
  exchangeFor: string;
  description: string;
}

export default function ListBookPage() {
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    isbn: null, // Initialized missing property
    genre: null, // Initialized missing property
    publication_year: null, // Initialized missing property
    cover_image_url: null, // Initialized missing property
    pages: null, // Initialized missing property
    language: null, // Initialized missing property
    pdf_url: null, // Initialized missing property
    condition: "",
    type: "sell", // sell, exchange, free
    price: 0,
    exchangeFor: "",
    description: "",
  });
  const router = useRouter();
  const { addBook } = useBooks(); // Use the addBook function from BookContext

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bookToSubmit: Omit<Book, 'id' | 'created_at'> = { // Removed sellerId, sellerName, postedDate from Omit
      ...formData,
      condition: formData.condition as "new" | "used-like-new" | "used-good" | "used-fair",
      type: formData.type as "sell" | "exchange" | "free",
    };
    addBook(bookToSubmit); // Use addBook from context
    toast.success("Book listed successfully!");
    router.push("/books");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">List Your Book</h1>
        <p className="text-lg text-gray-600 mb-8">
          Fill out the details below to list your academic book for sale, exchange, or to give away for free.
        </p>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Book Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Data Structures and Algorithms"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                placeholder="e.g., Thomas Cormen"
                value={formData.author}
                onChange={(e) => handleChange("author", e.target.value)}
                required
              />
            </div>
            {/* New fields added */}
            <div>
              <Label htmlFor="isbn">ISBN (Optional)</Label>
              <Input
                id="isbn"
                placeholder="e.g., 978-0262033848"
                value={formData.isbn || ""}
                onChange={(e) => handleChange("isbn", e.target.value || null)}
              />
            </div>
            <div>
              <Label htmlFor="genre">Genre (Optional)</Label>
              <Input
                id="genre"
                placeholder="e.g., Computer Science, Textbook"
                value={formData.genre || ""}
                onChange={(e) => handleChange("genre", e.target.value || null)}
              />
            </div>
            <div>
              <Label htmlFor="publication_year">Publication Year (Optional)</Label>
              <Input
                id="publication_year"
                type="number"
                placeholder="e.g., 2009"
                value={formData.publication_year || ""}
                onChange={(e) => handleChange("publication_year", e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>
            <div>
              <Label htmlFor="cover_image_url">Cover Image URL (Optional)</Label>
              <Input
                id="cover_image_url"
                placeholder="https://example.com/image.jpg"
                value={formData.cover_image_url || ""}
                onChange={(e) => handleChange("cover_image_url", e.target.value || null)}
              />
            </div>
            <div>
              <Label htmlFor="pages">Number of Pages (Optional)</Label>
              <Input
                id="pages"
                type="number"
                placeholder="e.g., 300"
                value={formData.pages || ""}
                onChange={(e) => handleChange("pages", e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>
            <div>
              <Label htmlFor="language">Language (Optional)</Label>
              <Input
                id="language"
                placeholder="e.g., English"
                value={formData.language || ""}
                onChange={(e) => handleChange("language", e.target.value || null)}
              />
            </div>
            <div>
              <Label htmlFor="pdf_url">Digital Copy URL (Optional - if applicable)</Label>
              <Input
                id="pdf_url"
                placeholder="https://example.com/book.pdf"
                value={formData.pdf_url || ""}
                onChange={(e) => handleChange("pdf_url", e.target.value || null)}
              />
            </div>
            <div>
              <Label htmlFor="condition">Condition *</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => handleChange("condition", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used-like-new">Used - Like New</SelectItem>
                  <SelectItem value="used-good">Used - Good</SelectItem>
                  <SelectItem value="used-fair">Used - Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Listing Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="exchange">Exchange</SelectItem>
                  <SelectItem value="free">Give Away (Free)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === "sell" && (
              <div>
                <Label htmlFor="price">Price (NPR) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="500"
                  value={formData.price}
                  onChange={(e) => handleChange("price", parseInt(e.target.value))}
                  min="0"
                  required
                />
              </div>
            )}

            {formData.type === "exchange" && (
              <div>
                <Label htmlFor="exchangeFor">Exchange For *</Label>
                <Input
                  id="exchangeFor"
                  placeholder="e.g., Linear Algebra textbook"
                  value={formData.exchangeFor}
                  onChange={(e) => handleChange("exchangeFor", e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add more details about the book, e.g., edition, highlights, any damages..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full">
              List Book
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
