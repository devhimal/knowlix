"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import supabase from "@/lib/supabase";
import { User as SupabaseUserBase, Session } from "@supabase/supabase-js";

// Define roles
export type UserRole = 'admin' | 'student' | 'mentor' | 'super_admin' | null;

// Extend Supabase's UserMetadata for custom fields
export interface CustomUserMetadata {
  [key: string]: any; // Allow any other properties from Supabase's user_metadata
  name?: string;
  course?: string;
  semester?: string;
  role?: UserRole;
}

// Custom User type combining SupabaseUserBase properties with custom ones
export interface User extends Omit<SupabaseUserBase, 'user_metadata'> {
  id: string; // Ensure id is always present
  user_metadata: CustomUserMetadata;
  subscription?: {
    isSubscribed: boolean;
    plan: string;
    expiryDate: string;
  };
}

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
    name?: string,
    course?: string,
    semester?: string,
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
    let initialized = false;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event);
        setSession(session);
        if (session) {
          // Cast SupabaseUser to custom User type
          const customUser: User = {
            id: session.user.id,
            email: session.user.email,
            phone: session.user.phone,
            app_metadata: session.user.app_metadata,
            aud: session.user.aud,
            confirmed_at: session.user.confirmed_at,
            created_at: session.user.created_at,
            email_confirmed_at: session.user.email_confirmed_at,
            factors: session.user.factors,
            last_sign_in_at: session.user.last_sign_in_at,
            new_email: session.user.new_email,
            phone_confirmed_at: session.user.phone_confirmed_at,
            role: session.user.role,
            updated_at: session.user.updated_at,
            user_metadata: {
              ...session.user.user_metadata,
              name: session.user.user_metadata?.name,
              course: session.user.user_metadata?.course,
              semester: session.user.user_metadata?.semester,
              role: session.user.user_metadata?.role as UserRole,
            },
            subscription: {
              isSubscribed: false,
              plan: 'free',
              expiryDate: new Date().toISOString(),
            },
          };
          setUser(customUser);
          setRole((customUser.user_metadata?.role as UserRole) || null); // Access role from session.user directly
        } else {
          setUser(null);
          setRole(null);
        }
        
        // Only set loading to false if we've already initialized or if this is a sign-in/out event after initialization
        if (initialized) {
          setLoading(false);
        }
      }
    );

    // Initial check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("Initial session check:", { hasSession: !!session, error: error?.message });
      if (error) {
        console.error("Error getting initial session:", error.message);
        if (error.message.includes("Refresh Token")) {
          supabase.auth.signOut();
        }
      }
      setSession(session);
      if (session) {
        const customUser: User = {
          id: session.user.id,
          email: session.user.email,
          phone: session.user.phone,
          app_metadata: session.user.app_metadata,
          aud: session.user.aud,
          confirmed_at: session.user.confirmed_at,
          created_at: session.user.created_at,
          email_confirmed_at: session.user.email_confirmed_at,
          factors: session.user.factors,
          last_sign_in_at: session.user.last_sign_in_at,
          new_email: session.user.new_email,
          phone_confirmed_at: session.user.phone_confirmed_at,
          role: session.user.role,
          updated_at: session.user.updated_at,
          user_metadata: {
            ...session.user.user_metadata,
            name: session.user.user_metadata?.name,
            course: session.user.user_metadata?.course,
            semester: session.user.user_metadata?.semester,
            role: session.user.user_metadata?.role as UserRole,
          },
          subscription: {
            isSubscribed: false,
            plan: 'free',
            expiryDate: new Date().toISOString(),
          },
        };
        setUser(customUser);
        setRole((customUser.user_metadata?.role as UserRole) || null);
      } else {
        setUser(null);
        setRole(null);
      }
    }).catch(err => {
      console.error("Unexpected error in getSession:", err);
    }).finally(() => {
      initialized = true;
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
    name?: string,
    course?: string,
    semester?: string,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: selectedRole, name, course, semester } },
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
