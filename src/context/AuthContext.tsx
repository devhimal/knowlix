import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'senior' | 'mentor' | 'admin';
  avatar?: string;
  course?: string;
  semester?: string;
  subscription?: {
    isSubscribed: boolean;
    plan: 'free' | 'monthly' | 'semester' | 'annual';
    expiryDate: string | null;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'student' | 'senior' | 'mentor' | 'admin') => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync Supabase Auth state
  useEffect(() => {
    // 1. Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        const mappedUser: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          course: data.course,
          semester: data.semester,
          subscription: data.subscription,
        };
        setUser(mappedUser);
        localStorage.setItem('user', JSON.stringify(mappedUser));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, role: 'student' | 'senior' | 'mentor' | 'admin') => {
    // Attempt Supabase Login first
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Fallback to mock login for demo purposes if Supabase is not configured
      console.warn('Supabase login failed, using mock login:', error.message);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email,
        role,
        course: role === 'student' ? 'Computer Science' : undefined,
        semester: role === 'student' ? '5th Semester' : undefined,
        subscription: {
          isSubscribed: false,
          plan: 'free',
          expiryDate: null,
        }
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user?.id) {
      // Sync with Supabase if it's a UUID
      if (user.id.length > 20) {
        await supabase
          .from('profiles')
          .update(userData)
          .eq('id', user.id);
      }
    }

    setUser(prev => {
      if (!prev) return null;
      const updatedUser = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout, updateUser, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};