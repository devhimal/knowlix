import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  console.log('API check-email called with:', email);

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const adminClient = getSupabaseAdmin();
  if (!adminClient) {
    console.error('Server configuration error: No admin client');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Use the admin client to query users from auth schema
  const { data, error } = await adminClient.auth.admin.listUsers();

  if (error) {
    console.error('Error fetching users:', error);
    // Return a more informative error message or just false for exists if fetching fails
    return NextResponse.json({ exists: false, error: 'Internal server error' }, { status: 500 });
  }

  const userExists = data.users.some(u => u.email === email);
  console.log(`User ${email} exists: ${userExists}`);

  return NextResponse.json({ exists: userExists });
}
