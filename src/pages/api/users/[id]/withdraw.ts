import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient(req, res); 
  if (req.method === 'POST') {
    const { id: userId } = req.query; 
    const { amount, method } = req.body; 

    
    if (!userId || !amount || !method) {
      return res.status(400).json({ error: 'Missing userId, amount, or method' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || user.id !== userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID does not match authenticated user.' });
    }

    
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, balance')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ error: 'User profile not found or database error.' });
    }

    if (userProfile.balance < amount) {
      return res.status(402).json({ error: 'Insufficient balance for withdrawal.' });
    }

    
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .insert([
        {
          student_id: userId,
          amount,
          method,
          status: 'pending', 
          request_date: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error creating withdrawal request:', error);
      return res.status(500).json({ error: error.message });
    }

    
    

    return res.status(201).json({ message: 'Withdrawal request created successfully', data });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
