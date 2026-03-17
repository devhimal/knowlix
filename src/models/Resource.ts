import mongoose, { Document, Model, Schema } from "mongoose";

export interface IResource extends Document {
  title: string;
  description: string;
  type: string;
  uploadedBy: mongoose.Types.ObjectId;
  classification: {
    class: string;
    subject: string;
    topic: string;
    subtopic: string;
  };
  files: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    thumbnailUrl: string;
    toc: { title: string; page: number }[];
  }[];
  workflow: {
    currentStage: string;
    submittedAt: Date;
  };
  engagement: {
    views: number;
    downloads: number;
    likes: mongoose.Types.ObjectId[];
    comments: {
      userId: mongoose.Types.ObjectId;
      content: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
    shares: number;
  };
  quality: {
    averageRating: number;
    totalRatings: number;
    isTrending: boolean;
    isPopular: boolean;
    isFeatured: boolean;
  };
  tags: string[];
  status: string;
  visibility: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema: Schema<IResource> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  classification: {
    class: { type: String, required: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    subtopic: { type: String },
  },
  files: [
    {
      fileName: { type: String, required: true },
      fileUrl: { type: String, required: true },
      fileSize: { type: Number, required: true },
      fileType: { type: String, required: true },
      thumbnailUrl: { type: String },
    },
  ],
  workflow: {
    currentStage: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  engagement: {
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        content: { type: String },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    shares: { type: Number, default: 0 },
  },
  quality: {
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    isTrending: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  tags: [{ type: String }],
  status: { type: String, required: true },
  visibility: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Resource: Model<IResource> =
  mongoose.models.Resource ||
  mongoose.model<IResource>("Resource", ResourceSchema);

export default Resource;
