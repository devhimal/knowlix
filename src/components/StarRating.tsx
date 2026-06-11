"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  initialRating?: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
}

export const StarRating = ({
  initialRating = 0,
  maxRating = 5,
  onRatingChange,
  readOnly = false,
}: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(initialRating);

  const handleStarClick = (ratingValue: number) => {
    if (readOnly) return;
    setCurrentRating(ratingValue);
    onRatingChange?.(ratingValue);
  };

  const handleMouseEnter = (ratingValue: number) => {
    if (readOnly) return;
    setHoverRating(ratingValue);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  const displayRating = hoverRating || currentRating;

  return (
    <div className="flex items-center">
      {[...Array(maxRating)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <Star
            key={index}
            className={cn(
              "h-5 w-5 cursor-pointer transition-colors duration-200",
              (displayRating >= ratingValue) ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300",
              readOnly ? "cursor-default" : "hover:text-yellow-500 hover:fill-yellow-500"
            )}
            onClick={() => handleStarClick(ratingValue)}
            onMouseEnter={() => handleMouseEnter(ratingValue)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </div>
  );
};
