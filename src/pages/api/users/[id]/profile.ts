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

    
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, balance, created_at') 
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ error: 'User profile not found or database error.' });
    }

    return res.status(200).json(userProfile);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
