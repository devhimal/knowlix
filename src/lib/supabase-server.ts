
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
          const cookieParts = [`${name}=${value}`];
          
          if (options.maxAge !== undefined) {
            cookieParts.push(`Max-Age=${options.maxAge}`);
          }
          if (options.path) {
            cookieParts.push(`Path=${options.path}`);
          }
          if (options.domain) {
            cookieParts.push(`Domain=${options.domain}`);
          }
          if (options.secure) {
            cookieParts.push('Secure');
          }
          if (options.httpOnly) {
            cookieParts.push('HttpOnly');
          }
          if (options.sameSite) {
            cookieParts.push(`SameSite=${options.sameSite}`);
          }

          const cookieString = cookieParts.join('; ');
          
          // Get existing cookies to avoid overwriting
          const existingCookies = res.getHeader('Set-Cookie');
          let newCookies: string[] = [];
          
          if (Array.isArray(existingCookies)) {
            newCookies = [...existingCookies, cookieString];
          } else if (typeof existingCookies === 'string') {
            newCookies = [existingCookies, cookieString];
          } else {
            newCookies = [cookieString];
          }
          
          res.setHeader('Set-Cookie', newCookies);
        },
        remove(name: string, options: any) {
          const cookieParts = [`${name}=`, 'Max-Age=0'];
          
          if (options.path) {
            cookieParts.push(`Path=${options.path}`);
          }
          if (options.domain) {
            cookieParts.push(`Domain=${options.domain}`);
          }

          const cookieString = cookieParts.join('; ');
          
          const existingCookies = res.getHeader('Set-Cookie');
          let newCookies: string[] = [];
          
          if (Array.isArray(existingCookies)) {
            newCookies = [...existingCookies, cookieString];
          } else if (typeof existingCookies === 'string') {
            newCookies = [existingCookies, cookieString];
          } else {
            newCookies = [cookieString];
          }
          
          res.setHeader('Set-Cookie', newCookies);
        set(name: string, value: string, options: any) { 
          res.setHeader('Set-Cookie', serialize(name, value, options));
        },
        remove(name: string, options: any) { 
          res.setHeader('Set-Cookie', serialize(name, '', options));
        },
      },
    }
  );
};
