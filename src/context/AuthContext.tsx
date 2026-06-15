"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import supabase from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "student" | "mentor" | "super_admin" | null;

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  emailExists: boolean; 
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    error: string | null;
    emailExists?: boolean;
  }>;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<{
    success: boolean;
    error: string | null;
    emailExists?: boolean;
  }>;
  signOut: () => Promise<{ success: boolean; error: string | null }>;
  checkEmailExists: (email: string) => Promise<boolean>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_ROLES: UserRole[] = ["admin", "student", "mentor", "super_admin"];

function parseRole(raw: unknown): UserRole {
  return VALID_ROLES.includes(raw as UserRole) ? (raw as UserRole) : null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [emailExists, setEmailExists] = useState(false); 

  useEffect(() => {
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setRole(parseRole(session?.user?.user_metadata?.role));
      setLoading(false);
    });

    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setRole(parseRole(session?.user?.user_metadata?.role));
    });

    return () => subscription.unsubscribe();
  }, []);

  
  const checkEmailExists = async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    
    
    
    if (error) {
      
      const notFound =
        error.message.toLowerCase().includes("email not found") ||
        error.message.toLowerCase().includes("user not found") ||
        error.message.toLowerCase().includes("no user found");
      return !notFound; 
    }

    
    return true;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email,
      password,
    });

    console.log('AuthContext signIn: Supabase data after login attempt:', data); 
    console.log('AuthContext signIn: Supabase error after login attempt:', error); 

    if (error) {
      
      
      if (error.message.includes("Invalid login credentials")) {
        const exists = await checkEmailExists(email);
        setEmailExists(exists);
        return {
          success: false,
          emailExists: exists,
          error: exists
            ? "Incorrect password. Please try again or reset your password."
            : "No account found with this email. Please sign up first.",
        };
      }
      return { success: false, error: error.message };
    }

    setEmailExists(true); 
    return { success: true, error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    selectedRole: UserRole,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: selectedRole } },
    });

    if (error) {
      const isDuplicate =
        error.message.includes("User already registered") ||
        error.message.includes(
          "duplicate key value violates unique constraint",
        );

      if (isDuplicate) {
        setEmailExists(true);
        return {
          success: false,
          emailExists: true,
          error:
            "An account with this email already exists. Please log in instead.",
        };
      }
      return { success: false, error: error.message };
    }

    
    
    if (!data.user && !data.session) {
      setEmailExists(true);
      return {
        success: false,
        emailExists: true,
        error:
          "An account with this email already exists. Please log in instead.",
      };
    }

    setEmailExists(false); 
    return { success: true, error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };
    setEmailExists(false);
    return { success: true, error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        session,
        emailExists,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        checkEmailExists,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
