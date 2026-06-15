import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient(req, res); 
  if (req.method === 'GET') {
    const { seller_id, buyer_id } = req.query;

    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized: No authenticated user.' });
    }

    let query = supabase.from('transactions').select('*');

    if (seller_id) {
      if (user.id !== seller_id) {
        return res.status(403).json({ error: 'Forbidden: You can only view your own sales transactions.' });
      }
      query = query.eq('seller_id', seller_id);
    } else if (buyer_id) {
        if (user.id !== buyer_id) {
            return res.status(403).json({ error: 'Forbidden: You can only view your own purchase transactions.' });
        }
        query = query.eq('buyer_id', buyer_id);
    } else {
        
        query = query.or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`);
    }


    const { data: transactions, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(transactions);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
