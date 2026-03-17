import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/db";
import Resource from "@/models/Resource";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  await clientPromise;

  if (req.method === "GET") {
    try {
      const resource = await Resource.findById(id);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.status(200).json(resource);
    } catch (error) {
      res.status(500).json({ message: "Error fetching resource", error });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
