import { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function handler(

  req: NextApiRequest,

  res: NextApiResponse,

) {

  console.log('API Subscriptions: Incoming request method -', req.method);

  console.log('API Subscriptions: Request cookies -', req.headers.cookie); // Log incoming cookies



  const supabase = createServerSupabaseClient(req, res); // Get server-side Supabase client



  if (req.method === "POST") {

    const { plan_id, end_date } = req.body;



    // Get authenticated user

    const { data: { user }, error: authError } = await supabase.auth.getUser(); // <-- This is where the problem is



    console.log('API Subscriptions: Supabase authError -', authError);

    console.log('API Subscriptions: Supabase user -', user);



    if (authError || !user) {

      return res.status(401).json({ error: 'Unauthorized: User not authenticated.' });

    }

    const authenticated_user_id = user.id; // Use the authenticated user's ID

    // Basic validation (only for plan_id and end_date now)
    if (!plan_id || !end_date) {
      return res
        .status(400)
        .json({ error: "Missing required fields: plan_id, end_date" });
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .insert([{ user_id: authenticated_user_id, plan_id, end_date, status: "active" }]);

    if (error) {
      console.error("Error creating subscription:", error);
      return res.status(500).json({ error: error.message });
    }

    return res
      .status(201)
      .json({ message: "Subscription created successfully", data });
  } else if (req.method === "GET") {
    // Retrieve a user's subscription status
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id query parameter" });
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .order("end_date", { ascending: false }); // Get most recent subscription first

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
