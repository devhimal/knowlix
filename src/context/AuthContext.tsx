"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import supabase from '@/lib/supabase'; // Import the Supabase client
import { User, Session } from '@supabase/supabase-js';

// Define roles
export type UserRole = 'admin' | 'student' | 'super_admin' | null;

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  isAuthenticated: boolean;
  session: Session | null; // Add session to context type
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signUp: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<{ success: boolean; error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null); // Add session state

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session); // Update session state
        if (session) {
          setUser(session.user);
          // Fetch user role from public.profiles table or user metadata
          // For now, let's assume role is in user_metadata
          setRole((session.user.user_metadata?.role as UserRole) || null);
        } else {
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); // Update session state
      if (session) {
        setUser(session.user);
        setRole((session.user.user_metadata?.role as UserRole) || null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      return { success: false, error: error.message };
    }
    // Session will be set by onAuthStateChange listener
    return { success: true, error: null };
  };

  const signUp = async (email: string, password: string, selectedRole: UserRole) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: selectedRole }, // Store role in user metadata
      },
    });
    setLoading(false);
    if (error) {
      return { success: false, error: error.message };
    }
    // Session will be set by onAuthStateChange listener
    return { success: true, error: null };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signUp, signOut, isAuthenticated: !!user, session }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
