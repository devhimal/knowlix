import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, type = 'resource' } = req.query; // id is the target ID, type is 'resource' or 'book'
  const token = req.headers.authorization?.split(' ')[1];

  if (!token && req.method === 'POST') {
    return res.status(401).json({ error: 'Unauthorized: No access token provided.' });
  }

  // Create a Supabase client that acts as the authenticated user
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });

  const targetField = type === 'book' ? 'book_id' : 'resource_id';

  if (req.method === 'POST') {
    const { userId, userName, rating, comment } = req.body;

    if (!id || !userId || !rating) {
      return res.status(400).json({ error: `Missing required fields: ${type}Id, userId, rating` });
    }

    try {
      // Check if user has already rated this target
      const { data: existingRating, error: fetchError } = await supabase
        .from('resource_ratings')
        .select('*')
        .eq(targetField, id)
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let response;
      if (existingRating) {
        // Update existing rating
        response = await supabase
          .from('resource_ratings')
          .update({ rating, comment, user_name: userName, created_at: new Date().toISOString() })
          .eq(targetField, id)
          .eq('user_id', userId);
      } else {
        // Insert new rating
        const insertData = {
          user_id: userId,
          user_name: userName,
          rating,
          comment,
          [targetField]: id
        };
        response = await supabase
          .from('resource_ratings')
          .insert(insertData);
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
        .eq(targetField, id);

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
