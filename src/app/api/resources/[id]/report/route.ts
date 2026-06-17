import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: resourceId } = await context.params;
    const { reason } = await req.json();

    if (!resourceId || !reason) {
      return NextResponse.json({ error: 'Missing resource ID or reason' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) { return (await cookieStore).get(name)?.value; },
          async set(name: string, value: string, options: any) { (await cookieStore).set({ name, value, ...options }); },
          async remove(name: string, options: any) { (await cookieStore).delete({ name, ...options }); },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error: reportError } = await supabase
      .from('resource_reports')
      .insert({
        resource_id: resourceId,
        reporter_id: user.id,
        reason: reason
      });

    if (reportError) {
      throw reportError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error reporting resource:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
