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
  emailExists: boolean; // <-- new flag
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
  checkEmailExists: (email: string) => Promise<boolean>; // <-- new utility
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
  const [emailExists, setEmailExists] = useState(false); // <-- tracks duplicate email state

  useEffect(() => {
    // Seed state from persisted session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setRole(parseRole(session?.user?.user_metadata?.role));
      setLoading(false);
    });

    // Sync future auth events (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setRole(parseRole(session?.user?.user_metadata?.role));
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Checks if an email is already registered.
   * Strategy: attempt OTP sign-in (magic link).
   * - If Supabase returns "Email not confirmed" or similar → email EXISTS in the system
   * - If it returns no error (OTP sent) → likely a NEW email
   * - We use `shouldCreateUser: false` so Supabase never creates a new account
   */
  const checkEmailExists = async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    // If shouldCreateUser is false and the email doesn't exist,
    // Supabase returns: "Email not found" or similar error
    // If it DOES exist, it sends the OTP (no error) or returns a known error
    if (error) {
      // "Email not found" means email does NOT exist
      const notFound =
        error.message.toLowerCase().includes("email not found") ||
        error.message.toLowerCase().includes("user not found") ||
        error.message.toLowerCase().includes("no user found");
      return !notFound; // if it's NOT a "not found" error → email likely exists
    }

    // No error = OTP was sent = email EXISTS
    return true;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ // Get data as well
      email,
      password,
    });

    console.log('AuthContext signIn: Supabase data after login attempt:', data); // Add this log
    console.log('AuthContext signIn: Supabase error after login attempt:', error); // Add this log

    if (error) {
      // "Invalid login credentials" can mean wrong password OR email doesn't exist.
      // We do a secondary check only on this ambiguous error.
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

    setEmailExists(true); // signed in successfully → email obviously exists
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

    // Supabase returns { user: null, session: null } for existing emails
    // when email enumeration protection is enabled — treat as duplicate
    if (!data.user && !data.session) {
      setEmailExists(true);
      return {
        success: false,
        emailExists: true,
        error:
          "An account with this email already exists. Please log in instead.",
      };
    }

    setEmailExists(false); // fresh account created
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
