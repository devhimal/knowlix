import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; 
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No access token provided.' });
  }

  
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  if (req.method === 'POST') {
    const { userId, rating, comment } = req.body;

    if (!id || !userId || !rating) {
      return res.status(400).json({ error: 'Missing required fields: resourceId, userId, rating' });
    }

    try {
      
      const { data: existingRating, error: fetchError } = await supabase
        .from('resource_ratings')
        .select('*')
        .eq('resource_id', id)
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { 
        throw fetchError;
      }

      let response;
      if (existingRating) {
        
        response = await supabase
          .from('resource_ratings')
          .update({ rating, comment, created_at: new Date().toISOString() }) 
          .eq('resource_id', id)
          .eq('user_id', userId);
      } else {
        
        response = await supabase
          .from('resource_ratings')
          .insert({ resource_id: id, user_id: userId, rating, comment });
      }

      const { data, error } = response;

      if (error) {
        throw error;
      }

      res.status(200).json({ message: 'Rating submitted successfully', data });
    } catch (error: any) {
      console.error('Error submitting rating:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('resource_ratings')
        .select('*')
        .eq('resource_id', id);

      if (error) {
        throw error;
      }

      res.status(200).json(data);
    } catch (error: any) {
      console.error('Error fetching ratings:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
