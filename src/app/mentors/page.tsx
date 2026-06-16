"use client";

import { useMentors } from "@/context/MentorContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react"; 

export default function MentorsPage() {
  const { mentors, loading, fetchMentors } = useMentors();
  const router = useRouter();

  useEffect(() => {
    
    
    fetchMentors();
  }, [fetchMentors]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="sr-only">Loading mentors...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Our Mentors</h1>
      {mentors && mentors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mentors.map((mentor) => (
            <div key={mentor.id} className="bg-card p-6 rounded-lg shadow-md">
              {mentor.profile_picture_url && (
                <img
                  src={mentor.profile_picture_url}
                  alt={mentor.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
              )}
              <h2 className="text-2xl font-semibold text-center mb-2">
                {mentor.name}
              </h2>
              <p className="text-center text-muted-foreground mb-4">
                {mentor.email}
              </p>
              {mentor.bio && (
                <p className="text-text-foreground text-sm mb-4">
                  {mentor.bio}
                </p>
              )}
              {mentor.specialties && mentor.specialties.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {mentor.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="bg-primary-foreground text-primary px-3 py-1 rounded-full text-xs"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No mentors found.</p>
      )}
    </div>
  );
}
