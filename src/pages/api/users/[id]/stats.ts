import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // user_id

  if (req.method === 'GET') {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No access token provided.' });
    }

    // Create a Supabase client that acts as the authenticated user
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    try {
      // Fetch uploads count
      const { count: uploadsCount, error: uploadsError } = await supabase
        .from('resources')
        .select('id', { count: 'exact' })
        .eq('uploader_id', id);

      if (uploadsError) throw uploadsError;

      // Fetch total downloads for user's resources
      const { data: downloadsData, error: downloadsError } = await supabase
        .from('resources')
        .select('downloads')
        .eq('uploader_id', id);

      if (downloadsError) throw downloadsError;

      const totalDownloads = downloadsData?.reduce((sum, resource) => sum + resource.downloads, 0) || 0;

      // Fetch average rating for user's resources
      const { data: avgRatingData, error: avgRatingError } = await supabase
        .from('resources')
        .select('average_rating')
        .eq('uploader_id', id);

      if (avgRatingError) throw avgRatingError;

      const validRatings = avgRatingData?.filter(resource => typeof resource.average_rating === 'number')
        .map(resource => resource.average_rating) || [];
      const averageRating = validRatings.length > 0
        ? validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length
        : 0;

      res.status(200).json({
        uploads: uploadsCount || 0,
        downloads: totalDownloads,
        averageRating: parseFloat(averageRating.toFixed(1)),
        points: 0, // Placeholder for now
      });

    } catch (error: any) {
      console.error('Error fetching user stats:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}