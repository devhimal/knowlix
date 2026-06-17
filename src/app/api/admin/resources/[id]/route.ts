import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  console.log('[API] PUT /api/admin/resources/[id]: Initiated');

  try {
    const { id: resourceId } = await context.params;
    const updates = await request.json();

    if (!resourceId) {
      return NextResponse.json({ error: 'Missing resource ID' }, { status: 400 });
    }

    // 1. Initialize Server-Side Supabase Client (User Context)
    const cookieStore = await cookies();
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      console.error('[API] Error: Missing Supabase configuration or service role key');
      return NextResponse.json({ error: 'Server configuration error: Missing Supabase keys' }, { status: 500 });
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    });

    // 2. Authenticate the Requester
    let userData = null;
    let authError = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data, error } = await supabase.auth.getUser(token);
      userData = data.user;
      authError = error;
    } else {
      const { data, error } = await supabase.auth.getUser();
      userData = data.user;
      authError = error;
    }

    if (authError || !userData) {
      console.warn('[API] Unauthorized access attempt:', authError?.message || 'No user');
      return NextResponse.json({ 
        error: `Unauthorized: ${authError?.message || 'No valid session found'}`,
        auth_error: authError
      }, { status: 401 });
    }

    const user = userData;

    // 3. Verify Admin/Super_admin Authorization
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('[API] Forbidden: Could not verify user profile', profileError);
      return NextResponse.json({ error: 'Forbidden: Admin verification failed' }, { status: 403 });
    }

    if (!['admin', 'super_admin'].includes(profile.role)) {
      console.warn(`[API] Forbidden: User ${user.email} has insufficient role: ${profile.role}`);
      return NextResponse.json({ error: `Forbidden: Admin or Super Admin role required (Current: ${profile.role})` }, { status: 403 });
    }

    // 4. Update Resource using Service Role Client
    const { error } = await supabaseAdmin
      .from('resources')
      .update(updates)
      .eq('id', resourceId);

    if (error) {
      console.error('[API] Error updating resource:', error);
      return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Resource updated successfully' });

  } catch (error: any) {
    console.error('[API] UNHANDLED CRITICAL ERROR:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      message: error.message,
      code: error.code
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('[API] DELETE /api/admin/resources/[id]: Initiated');

  try {
    const { id: resourceId } = await context.params;

    if (!resourceId) {
      return NextResponse.json({ error: 'Missing resource ID' }, { status: 400 });
    }

    // 1. Initialize Server-Side Supabase Client (User Context)
    const cookieStore = await cookies();
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      console.error('[API] Error: Missing Supabase configuration or service role key');
      return NextResponse.json({ error: 'Server configuration error: Missing Supabase keys' }, { status: 500 });
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    });

    // 2. Authenticate the Requester
    let userData = null;
    let authError = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data, error } = await supabase.auth.getUser(token);
      userData = data.user;
      authError = error;
    } else {
      const { data, error } = await supabase.auth.getUser();
      userData = data.user;
      authError = error;
    }

    if (authError || !userData) {
      console.warn('[API] Unauthorized access attempt:', authError?.message || 'No user');
      return NextResponse.json({ 
        error: `Unauthorized: ${authError?.message || 'No valid session found'}`,
        auth_error: authError
      }, { status: 401 });
    }

    const user = userData;

    // 3. Verify Admin/Super_admin Authorization
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('[API] Forbidden: Could not verify user profile', profileError);
      return NextResponse.json({ error: 'Forbidden: Admin verification failed' }, { status: 403 });
    }

    if (!['admin', 'super_admin'].includes(profile.role)) {
      console.warn(`[API] Forbidden: User ${user.email} has insufficient role: ${profile.role}`);
      return NextResponse.json({ error: `Forbidden: Admin or Super Admin role required (Current: ${profile.role})` }, { status: 403 });
    }

    // 4. Delete Resource using Service Role Client
    const { error } = await supabaseAdmin
      .from('resources')
      .delete()
      .eq('id', resourceId);

    if (error) {
      console.error('[API] Error deleting resource:', error);
      return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Resource deleted successfully' });

  } catch (error: any) {
    console.error('[API] UNHANDLED CRITICAL ERROR:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      message: error.message,
      code: error.code
    }, { status: 500 });
  }
}