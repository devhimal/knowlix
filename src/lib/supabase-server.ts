
import { createServerClient } from '@supabase/ssr'; 
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie'; 

export function createServerSupabaseClient(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1];
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
      cookies: {
        get(name: string) {
          return req.cookies[name];
        },
        set(name: string, value: string, options: any) { 
          res.setHeader('Set-Cookie', serialize(name, value, options));
        },
        remove(name: string, options: any) { 
          res.setHeader('Set-Cookie', serialize(name, '', { ...options, maxAge: 0 }));
        },
      },
    }
  );
};
