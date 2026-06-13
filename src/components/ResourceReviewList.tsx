"use client";

import { useEffect, useState } from "react";
import { Star, User } from "lucide-react";
import { StarRating } from "./StarRating";
import { formatDistanceToNow } from "date-fns";

interface Rating {
  id: string;
  created_at: string;
  resource_id: string;
  user_id: string;
  user_name?: string;
  rating: number;
  comment: string;
}

interface ResourceReviewListProps {
  resourceId: string;
  type?: 'resource' | 'book';
  refreshTrigger?: number;
}

import supabase from "@/lib/supabase";

export const ResourceReviewList = ({ resourceId, type = 'resource', refreshTrigger }: ResourceReviewListProps) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/resources/${resourceId}/ratings?type=${type}`);
      if (response.ok) {
        const data = await response.json();
        const sortedData = data.sort((a: Rating, b: Rating) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRatings(sortedData);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resourceId) {
      fetchRatings();

      // Set up real-time listener
      const channel = supabase
        .channel('ratings_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'resource_ratings',
            filter: type === 'book' ? `book_id=eq.${resourceId}` : `resource_id=eq.${resourceId}`
          },
          () => {
            fetchRatings();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [resourceId, type, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-4 mt-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (ratings.length === 0) {
    return (
      <div className="mt-8 p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <p className="text-gray-500">No reviews yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-bold text-gray-900">User Reviews ({ratings.length})</h3>
      <div className="grid gap-6">
        {ratings.map((rating) => (
          <div key={rating.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
            <div className="hidden sm:flex h-10 w-10 rounded-full bg-primary/10 items-center justify-center text-primary shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-grow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <StarRating readOnly initialRating={rating.rating} />
                  <span className="text-sm font-medium text-gray-900">{rating.user_name || "Anonymous User"}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                </span>
              </div>
              {rating.comment ? (
                <p className="text-gray-700 text-sm leading-relaxed">{rating.comment}</p>
              ) : (
                <p className="text-gray-400 text-xs italic">No comment provided.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
