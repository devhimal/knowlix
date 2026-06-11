import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const store = cookieStore;
          return store.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          const store = cookieStore;
          store.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          const store = cookieStore;
          store.set(name, '', options);
        },
      },
    },
  );
};
