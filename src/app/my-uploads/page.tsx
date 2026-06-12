"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useResources, Resource } from "@/context/ResourceContext";
import { useBooks, Book } from "@/context/BookContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Book as BookIcon, Package, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import Link from "next/link";

export default function MyUploadsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { resources, fetchResources, loading: resourcesLoading } = useResources();
  const { books, fetchBooks, loading: booksLoading } = useBooks();
  
  const [myResources, setMyResources] = useState<Resource[]>([]);
  const [myBooks, setMyBooks] = useState<Book[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResources();
      fetchBooks();
    }
  }, [isAuthenticated, fetchResources, fetchBooks]);

  useEffect(() => {
    if (user) {
      setMyResources(resources.filter(r => r.uploaderId === user.id));
      setMyBooks(books.filter(b => b.seller_id === user.id));
    }
  }, [user, resources, books]);

  if (authLoading || resourcesLoading || booksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Please login to view your uploads</h2>
        <Link href="/login" className="text-primary hover:underline">Go to Login</Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case "pending_ai":
      case "pending_plagiarism":
      case "pending_review":
      case "pending_admin":
        return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-primary pt-12 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">My Content</h1>
          <p className="text-white/80">Manage your uploaded resources and listed books.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12">
        <Tabs defaultValue="resources" className="space-y-6">
          <div className="bg-white p-1 rounded-lg shadow-sm inline-flex mb-6">
            <TabsList className="bg-transparent border-none">
              <TabsTrigger value="resources" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <FileText className="w-4 h-4 mr-2" />
                Resources ({myResources.length})
              </TabsTrigger>
              <TabsTrigger value="books" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <BookIcon className="w-4 h-4 mr-2" />
                Books ({myBooks.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myResources.length > 0 ? (
                myResources.map((resource) => (
                  <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                          <FileText className="w-6 h-6" />
                        </div>
                        {getStatusBadge(resource.status)}
                      </div>
                      <h3 className="font-bold text-lg mb-1 truncate">{resource.title}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{resource.description}</p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-xs text-gray-500">
                          <Package className="w-3 h-3 mr-2" />
                          {resource.subjectName} • {resource.semester}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-2" />
                          Uploaded on {new Date(resource.uploadDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/resources/${resource.id}`} className="flex-1">
                          <button className="w-full py-2 text-sm font-medium border rounded-md hover:bg-gray-50 transition-colors">
                            View
                          </button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-white rounded-xl border-2 border-dashed">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No resources uploaded yet</p>
                  <Link href="/upload">
                    <button className="mt-4 text-primary font-semibold hover:underline">Upload your first resource</button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="books">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBooks.length > 0 ? (
                myBooks.map((book) => (
                  <Card key={book.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-48 bg-gray-100">
                      {book.cover_image_url ? (
                        <ImageWithFallback
                          src={book.cover_image_url}
                          alt={book.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <BookIcon className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm border-none">
                          {book.type === "sell" ? `NPR ${book.price}` : book.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-1 truncate">{book.title}</h3>
                      <p className="text-sm text-gray-500 mb-4 truncate">by {book.author}</p>
                      
                      <div className="flex items-center text-xs text-gray-500 mb-6">
                        <AlertCircle className="w-3 h-3 mr-2" />
                        Condition: {book.condition}
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/books/${book.id}`} className="flex-1">
                          <button className="w-full py-2 text-sm font-medium border rounded-md hover:bg-gray-50 transition-colors">
                            View Listing
                          </button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-white rounded-xl border-2 border-dashed">
                  <BookIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No books listed yet</p>
                  <Link href="/books/list">
                    <button className="mt-4 text-primary font-semibold hover:underline">List your first book</button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
