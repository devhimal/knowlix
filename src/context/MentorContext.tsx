"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import supabase from "@/lib/supabase"; 

export interface Mentor {
  id: string;
  created_at: string;
  name: string;
  email: string;
  bio: string | null;
  specialties: string[] | null;
  profile_picture_url: string | null;
}

interface MentorContextType {
  mentors: Mentor[];
  fetchMentors: () => Promise<void>;
  loading: boolean;
}

const MentorContext = createContext<MentorContextType | undefined>(undefined);

export const useMentors = () => {
  const context = useContext(MentorContext);
  if (!context) {
    throw new Error("useMentors must be used within a MentorProvider");
  }
  return context;
};

export const MentorProvider = ({ children }: { children: ReactNode }) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("mentors").select("*");

      if (error) {
        throw error;
      }
      setMentors(data as Mentor[]);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  return (
    <MentorContext.Provider
      value={{
        mentors,
        fetchMentors,
        loading,
      }}
    >
      {children}
    </MentorContext.Provider>
  );
};
