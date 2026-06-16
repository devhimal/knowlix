import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Admin Users API Route
 * Handles fetching all users and updating user roles.
 * Uses the Supabase Service Role to bypass RLS for administrative tasks.
 */

export async function GET() {
  console.log('[API] GET /api/admin/users: Initiated');
  
  try {
    // 1. Initialize Server-Side Supabase Client (User Context)
    const cookieStore = await cookies();
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[API] Error: Missing public Supabase configuration');
      return NextResponse.json({ error: 'Server configuration error: Missing Supabase URL or Anon Key' }, { status: 500 });
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
      console.log('[API] Authenticating via Bearer token');
      const token = authHeader.split(' ')[1];
      const { data, error } = await supabase.auth.getUser(token);
      userData = data.user;
      authError = error;
    } else {
      console.log('[API] Authenticating via Cookies');
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

    const user = userData; // For consistency with rest of the code

    // 3. Verify Admin Authorization (Using Service Role Client for reliability)
    if (!serviceRoleKey) {
      console.error('[API] Error: SUPABASE_SERVICE_ROLE_KEY is not defined');
      return NextResponse.json({ error: 'Server configuration error: Admin access key missing' }, { status: 500 });
    }

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
      return NextResponse.json({ error: `Forbidden: Admin role required (Current: ${profile.role})` }, { status: 403 });
    }

    // 4. Fetch Data (Parallel execution for performance)
    console.log('[API] Fetching users and profiles...');
    const [authResult, profilesResult] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers(),
      supabaseAdmin.from('profiles').select('*')
    ]);

    if (authResult.error) {
      console.error('[API] Auth List Error:', authResult.error);
      return NextResponse.json({ error: 'Failed to fetch user list from Auth' }, { status: 500 });
    }

    if (profilesResult.error) {
      console.error('[API] Profiles Fetch Error:', profilesResult.error);
      return NextResponse.json({ error: 'Failed to fetch user profiles from Database' }, { status: 500 });
    }

    // 5. Merge and Return Data
    const combinedUsers = authResult.data.users.map(authUser => {
      const userProfile = profilesResult.data.find(p => p.id === authUser.id);
      return {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || 'Unknown',
        role: userProfile?.role || 'student',
        balance: userProfile?.balance || 0,
        is_premium: userProfile?.is_premium || false,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        metadata: authUser.user_metadata || {}
      };
    });

    console.log(`[API] Success: Returned ${combinedUsers.length} users`);
    return NextResponse.json(combinedUsers);

  } catch (error: any) {
    console.error('[API] UNHANDLED CRITICAL ERROR:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error.message,
      code: error.code
    }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  console.log('[API] PUT /api/admin/users: Initiated');
  
  try {
    const cookieStore = await cookies();
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey!, {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
        remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }); },
      },
    });

    // Verify Admin
    let userData = null;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data } = await supabase.auth.getUser(token);
      userData = data.user;
    } else {
      const { data } = await supabase.auth.getUser();
      userData = data.user;
    }

    if (!userData) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = userData;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Process Update
    const { userId, role: newRole } = await req.json();
    if (!userId || !newRole) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    console.log(`[API] Updating user ${userId} to role ${newRole}`);

    const [authUpdate, profileUpdate] = await Promise.all([
      supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: { role: newRole } }),
      supabaseAdmin.from('profiles').update({ role: newRole }).eq('id', userId)
    ]);

    if (authUpdate.error || profileUpdate.error) {
      console.error('[API] Update Error:', authUpdate.error || profileUpdate.error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[API] Update Critical Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
