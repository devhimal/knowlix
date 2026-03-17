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
    const bookToSubmit: Omit<Book, 'id' | 'sellerId' | 'sellerName' | 'postedDate'> = {
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
