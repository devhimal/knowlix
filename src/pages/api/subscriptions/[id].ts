import { NextApiRequest, NextApiResponse } from "next"; 
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const supabase = createServerSupabaseClient(req, res); 
  const { id } = req.query; 

  if (req.method === "PUT") {
    const { status } = req.body; 

    if (!id) {
      return res.status(400).json({ error: "Subscription ID is required" });
    }

    
    

    const { data, error } = await supabase
      .from("subscriptions")
      .update({ status, updated_at: new Date().toISOString() }) 
      .eq("id", id)
      .select(); 

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
