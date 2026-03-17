"use client";

import * as React from "react";
import { Star } from "lucide-react";

import { cn } from "@/components/ui/utils";

interface RatingProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  ({ rating, onRatingChange, readonly = false, className, ...props }, ref) => {
    const [hoverRating, setHoverRating] = React.useState<number | null>(null);

    const handleRating = (rate: number) => {
      if (readonly || !onRatingChange) return;
      onRatingChange(rate);
    };

    const handleMouseEnter = (rate: number) => {
      if (readonly) return;
      setHoverRating(rate);
    };

    const handleMouseLeave = () => {
      if (readonly) return;
      setHoverRating(null);
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1", className)}
        {...props}
      >
        {[...Array(5)].map((_, index) => {
          const rate = index + 1;
          return (
            <Star
              key={rate}
              className={cn(
                "h-5 w-5 cursor-pointer",
                rate <= (hoverRating ?? rating)
                  ? "text-yellow-500 fill-yellow-500"
                  "text-gray-300"
              )}
              onClick={() => handleRating(rate)}
              onMouseEnter={() => handleMouseEnter(rate)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </div>
    );
  }
);

Rating.displayName = "Rating";

export { Rating };
