import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient(req, res); 
  if (req.method === 'GET') {
    const { id: userId } = req.query; 

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || user.id !== userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID does not match authenticated user or no user found.' });
    }

    
    const { data: withdrawalRequests, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('student_id', userId)
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
