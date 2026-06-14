import { createServerClient } from '@supabase/ssr'; // Use createServerClient
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie'; // Assuming 'cookie' package is installed

export function createServerSupabaseClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies[name];
        },
        set(name: string, value: string, options: any) { // Use 'any' for options to avoid CookieOptions type mismatch
          res.setHeader('Set-Cookie', serialize(name, value, options));
        },
        remove(name: string, options: any) { // Use 'any' for options
          res.setHeader('Set-Cookie', serialize(name, '', options));
        },
      },
    }
  );
};
