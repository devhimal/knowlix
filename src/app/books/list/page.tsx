"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useBooks, Book } from "@/context/BookContext";
import { useAuth } from "@/context/AuthContext";
import supabase from "@/lib/supabase";
import { Upload, FileText, Image as ImageIcon, Loader2 } from "lucide-react";

interface BookFormData {
  title: string;
  author: string;
  isbn: string | null;
  genre: string | null;
  publication_year: number | null;
  pages: number | null;
  language: string | null;
  condition: string;
  type: "sell" | "exchange" | "free";
  price: number;
  exchangeFor: string;
  description: string;
}

export default function ListBookPage() {
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    isbn: null,
    genre: null,
    publication_year: null,
    pages: null,
    language: null,
    condition: "",
    type: "sell",
    price: 0,
    exchangeFor: "",
    description: "",
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const router = useRouter();
  const { addBook } = useBooks();
  const { user } = useAuth();

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const uploadFile = async (file: File, folder: string) => {
    if (!user) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('book_files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('book_files')
      .getPublicUrl(filePath);

    return { publicUrl, filePath };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to list a book");
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      let coverUrl = null;
      let coverPath = null;
      let fileUrl = null;
      let filePath = null;

      if (coverFile) {
        setUploadProgress(30);
        const coverData = await uploadFile(coverFile, 'covers');
        coverUrl = coverData?.publicUrl;
        coverPath = coverData?.filePath;
      }

      if (bookFile) {
        setUploadProgress(60);
        const bookData = await uploadFile(bookFile, 'digital_copies');
        fileUrl = bookData?.publicUrl;
        filePath = bookData?.filePath;
      }

      setUploadProgress(80);

      const bookToSubmit: Omit<Book, 'id' | 'created_at' | 'seller_id'> = {
        ...formData,
        cover_image_url: coverUrl || null,
        cover_image_path: coverPath || null,
        pdf_url: fileUrl || null,
        file_path: filePath || null,
        condition: formData.condition,
        type: formData.type as "sell" | "exchange" | "free",
      };

      await addBook(bookToSubmit);
      setUploadProgress(100);
      toast.success("Book listed successfully and pending review!");
      router.push("/books");
    } catch (error: any) {
      console.error("Error listing book:", error);
      toast.error(error.message || "Failed to list book");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">List Your Book</h1>
        <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto">
          Share your books with the community. You can sell, exchange, or give them away for free.
        </p>

        <Card className="p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Basic Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">Basic Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Book Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Data Structures and Algorithms"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    placeholder="e.g., Thomas Cormen"
                    value={formData.author}
                    onChange={(e) => handleChange("author", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN (Optional)</Label>
                  <Input
                    id="isbn"
                    placeholder="978-0262033848"
                    value={formData.isbn || ""}
                    onChange={(e) => handleChange("isbn", e.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    placeholder="Computer Science"
                    value={formData.genre || ""}
                    onChange={(e) => handleChange("genre", e.target.value || null)}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Files */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">Media & Files</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary transition-colors cursor-pointer relative"
                       onClick={() => document.getElementById('cover-upload')?.click()}>
                    <div className="space-y-1 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80">
                          {coverFile ? coverFile.name : "Upload a cover"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                    <input id="cover-upload" type="file" className="hidden" accept="image/*" 
                           onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Digital Copy (Optional)</Label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary transition-colors cursor-pointer relative"
                       onClick={() => document.getElementById('file-upload')?.click()}>
                    <div className="space-y-1 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80">
                          {bookFile ? bookFile.name : "Upload PDF/ePub"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">PDF, EPUB up to 20MB</p>
                    </div>
                    <input id="file-upload" type="file" className="hidden" accept=".pdf,.epub" 
                           onChange={(e) => setBookFile(e.target.files?.[0] || null)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Details & Monetization */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">Listing Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <Select value={formData.condition} onValueChange={(v) => handleChange("condition", v)} required>
                    <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used-like-new">Used - Like New</SelectItem>
                      <SelectItem value="used-good">Used - Good</SelectItem>
                      <SelectItem value="used-fair">Used - Fair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Listing Type *</Label>
                  <Select value={formData.type} onValueChange={(v) => handleChange("type", v)} required>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sell">Sell</SelectItem>
                      <SelectItem value="exchange">Exchange</SelectItem>
                      <SelectItem value="free">Give Away</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.type === "sell" && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price (NPR) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange("price", parseInt(e.target.value))}
                    min="0"
                    required
                  />
                </div>
              )}

              {formData.type === "exchange" && (
                <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell buyers more about the book..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading book details...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-lg" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "List My Book"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
