import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient(req, res); 
  if (req.method === 'GET') {
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized: No authenticated user.' });
    }

    
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log('[API] User Profile Check:', { userProfile, profileError });

    if (profileError || !userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Forbidden: User does not have admin privileges.', details: profileError });
    }

    
    const { data: withdrawalRequests, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .order('request_date', { ascending: false }); 

    if (fetchError) {
      console.error('Error fetching withdrawal requests:', fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    return res.status(200).json(withdrawalRequests);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
