// src/types/supabase.d.ts

import { User as SupabaseUser } from '@supabase/supabase-js';

// Define the structure of the subscription object
interface UserSubscription {
  isSubscribed: boolean;
  plan: string;
  expiryDate: string;
  // Add other subscription-related properties if they exist in your database
}

// Extend the User interface from @supabase/supabase-js
declare module '@supabase/supabase-js' {
  interface User extends SupabaseUser {
    subscription?: UserSubscription;
    // Add other custom user metadata properties if they exist in your database
    // For example, if you store role directly in user.user_metadata
    user_metadata: {
      role?: 'admin' | 'student' | 'mentor';
      [key: string]: any; // Allow other metadata properties
    };
  }
}
