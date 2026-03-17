import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/db";
import Rating from "@/models/Rating";
import Resource from "@/models/Resource";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const resourceId = id as string;

  await clientPromise;

  if (req.method === "POST") {
    try {
      const { rating, comment, userId } = req.body;

      const newRating = new Rating({
        resourceId,
        userId,
        rating,
        comment,
      });

      await newRating.save();

      const resource = await Resource.findById(resourceId);
      if (resource) {
        const ratings = await Rating.find({ resourceId });
        const totalRatings = ratings.length;
        const averageRating =
          ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings;

        resource.quality.averageRating = averageRating;
        resource.quality.totalRatings = totalRatings;

        await resource.save();
      }

      res.status(201).json(newRating);
    } catch (error) {
      res.status(500).json({ message: "Error submitting rating", error });
    }
  } else if (req.method === "GET") {
    try {
      const ratings = await Rating.find({ resourceId }).populate("userId", "fullName");
      res.status(200).json(ratings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching ratings", error });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
