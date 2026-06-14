import { NextApiRequest, NextApiResponse } from "next"; // Added this import
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const supabase = createServerSupabaseClient(req, res); // Get server-side Supabase client
  const { id } = req.query; // Subscription ID

  if (req.method === "PUT") {
    const { status } = req.body; // e.g., 'cancelled', 'expired'

    if (!id) {
      return res.status(400).json({ error: "Subscription ID is required" });
    }

    // You might want to add more robust authorization here.
    // For example, checking if auth.uid() matches the user_id associated with this subscription ID.

    const { data, error } = await supabase
      .from("subscriptions")
      .update({ status, updated_at: new Date().toISOString() }) // Manually update updated_at for now
      .eq("id", id)
      .select(); // Add .select() to ensure data is an array

    if (error) {
      console.error("Error updating subscription:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ error: "Subscription not found or no changes made" });
    }

    return res
      .status(200)
      .json({ message: "Subscription updated successfully", data });
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
