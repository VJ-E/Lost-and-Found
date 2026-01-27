import mongoose, { Schema, models, model, type Document } from "mongoose";

export interface IItem extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  type: "lost" | "found";
  status: "open" | "claimed" | "resolved";
  location: string;
  date: Date;
  imageUrl?: string;
  contactInfo: string;
  reportedBy: mongoose.Types.ObjectId;
  claimedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Electronics",
        "Clothing",
        "Books",
        "Accessories",
        "Documents",
        "Keys",
        "Bags",
        "Sports Equipment",
        "Other",
      ],
    },
    type: {
      type: String,
      required: true,
      enum: ["lost", "found"],
    },
    status: {
      type: String,
      enum: ["open", "claimed", "resolved"],
      default: "open",
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    contactInfo: {
      type: String,
      required: [true, "Contact information is required"],
      trim: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    claimedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

ItemSchema.index({ type: 1, status: 1 });
ItemSchema.index({ category: 1 });
ItemSchema.index({ createdAt: -1 });
ItemSchema.index({ title: "text", description: "text" });

export const Item = models.Item || model<IItem>("Item", ItemSchema);
