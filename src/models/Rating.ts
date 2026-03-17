import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRating extends Document {
  resourceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const RatingSchema: Schema<IRating> = new Schema({
  resourceId: { type: Schema.Types.ObjectId, ref: "Resource", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Rating: Model<IRating> =
  mongoose.models.Rating || mongoose.model<IRating>("Rating", RatingSchema);

export default Rating;
