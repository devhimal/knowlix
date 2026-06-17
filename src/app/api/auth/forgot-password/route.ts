import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            return (await cookieStore).get(name)?.value;
          },
          async set(name: string, value: string, options: any) {
            (await cookieStore).set({ name, value, ...options });
          },
          async remove(name: string, options: any) {
            (await cookieStore).delete({ name, ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`, 
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Password reset email sent' });
  } catch (error: any) {
    console.error('Unhandled error in forgot-password API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}