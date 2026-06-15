"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BookCard from "@/components/BookCard";
import { useBooks } from "@/context/BookContext";
import ChatDialog from "@/components/ChatDialog";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Star, User, Book as BookIcon, Package, Clock, MessageCircle, ChevronLeft, Zap, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/StarRating";
import { ResourceReviewList } from "@/components/ResourceReviewList";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function BookDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : undefined;
  const { books, loading: booksLoading, fetchBooks } = useBooks();
  const { user, isAuthenticated, session } = useAuth();
  const [book, setBook] = useState<any>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [showConnect, setShowConnect] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [refreshReviews, setRefreshReviews] = useState(0);

  useEffect(() => {
    if (id && !booksLoading) {
      const foundBook = books.find((b: any) => b.id === id);
      if (foundBook) {
        setBook(foundBook);
      } else {
        setBook(null);
      }
      setLocalLoading(false);
    } else if (!id) {
      setLocalLoading(false);
    }
  }, [id, books, booksLoading]);

  const handleBuyClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login to buy this book");
      router.push("/login");
      return;
    }
    if (user?.id === book.seller_id) {
      toast.error("You cannot buy your own book");
      return;
    }
    setShowConnect(true);
  };

  const handleConnectClick = () => {
    if (!book.seller_id) {
      toast.error("Seller information not available");
      return;
    }
    setIsChatOpen(true);
  };

  const handleRatingSubmit = async () => {
    if (!isAuthenticated || !user || !session?.access_token) {
      toast.error("You must be logged in to submit a rating.");
      return;
    }

    if (userRating === 0) {
      toast.error("Please select a star rating.");
      return;
    }

    try {
      const response = await fetch(`/api/resources/${id}/ratings?type=book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          userName: user.user_metadata?.name || user.email,
          rating: userRating,
          comment: userComment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit rating.');
      }

      toast.success("Rating submitted successfully!");
      fetchBooks();
      setRefreshReviews(prev => prev + 1);
      setUserRating(0);
      setUserComment("");
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      toast.error(error.message || "Failed to submit rating.");
    }
  };

  if (localLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Book Not Found</h1>
          <Button onClick={() => router.push("/books")}>Back to Marketplace</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-primary pt-8 pb-32">
        <div className="max-w-7xl mx-auto px-4">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10 mb-6"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-none capitalize">
                  {book.type}
                </Badge>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span className="text-sm font-bold text-white">
                    {book.average_rating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-xs text-white/70">
                    ({book.total_ratings || 0} reviews)
                  </span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">{book.title}</h1>
              <p className="text-xl text-white/80">by {book.author}</p>
            </div>
            {book.type === "sell" && (
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-white min-w-[200px]">
                <p className="text-sm text-white/70 mb-1">Price</p>
                <p className="text-3xl font-bold">NPR {book.price}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">About this book</h2>
              <p className="text-gray-700 leading-relaxed mb-8">
                {book.description || "No description provided for this book."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Condition</p>
                  <p className="font-medium">{book.condition}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Language</p>
                  <p className="font-medium">{book.language || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Pages</p>
                  <p className="font-medium">{book.pages || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Listed Date</p>
                  <p className="font-medium">{new Date(book.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>

            {/* Reviews Section */}
            <Card className="p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-8">Ratings & Reviews</h2>
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-lg font-bold mb-4">Leave a Review</h3>
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">Your Rating</Label>
                        <StarRating initialRating={userRating} onRatingChange={setUserRating} />
                      </div>
                      <div>
                        <Label htmlFor="comment" className="text-sm text-gray-600 mb-2 block">Your Feedback</Label>
                        <Textarea
                          id="comment"
                          value={userComment}
                          onChange={(e) => setUserComment(e.target.value)}
                          placeholder="What do you think about this book?"
                          rows={4}
                        />
                      </div>
                      <Button onClick={handleRatingSubmit} className="w-full">
                        Submit Review
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-xl border border-dashed text-center">
                      <p className="text-sm text-gray-500 mb-4">Log in to share your review</p>
                      <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
                        Login
                      </Button>
                    </div>
                  )}
                </div>
                <div className="max-h-[500px] overflow-y-auto pr-2">
                  <ResourceReviewList resourceId={id || ""} type="book" refreshTrigger={refreshReviews} />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Seller</p>
                  <p className="font-bold">Student Seller</p>
                </div>
              </div>

              <div className="space-y-3">
                {!showConnect ? (
                  <>
                    <Button onClick={handleBuyClick} className="w-full h-12 text-lg">
                      {book.type === "sell" ? "Buy Now" : "Exchange Now"}
                    </Button>
                    <Button variant="outline" onClick={handleConnectClick} className="w-full h-12">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat with Seller
                    </Button>
                  </>
                ) : (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-blue-800 font-medium">
                      Ready to connect? Send a message to the seller to finalize the deal.
                    </p>
                    <Button onClick={handleConnectClick} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Confirm & Chat
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowConnect(false)} className="w-full text-blue-600">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 shadow-sm">
              <h3 className="font-bold mb-4">Safety Tips</h3>
              <ul className="text-xs text-gray-500 space-y-2">
                <li className="flex gap-2">
                  <Check className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                  Meet in public college spaces
                </li>
                <li className="flex gap-2">
                  <Check className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                  Inspect the book condition carefully
                </li>
                <li className="flex gap-2">
                  <Check className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                  Confirm price before meeting
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Related Books */}
        <section className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Related Books</h2>
            <Button variant="link" onClick={() => router.push("/books")}>
              View all
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books
              .filter((b: any) => b.id !== id)
              .slice(0, 3)
              .map((suggestedBook: any) => (
                <BookCard
                  key={suggestedBook.id}
                  {...suggestedBook}
                />
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
