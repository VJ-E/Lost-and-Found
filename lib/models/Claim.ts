import mongoose, { Schema, models, model, type Document } from "mongoose";

export interface IClaim extends Document {
  _id: mongoose.Types.ObjectId;
  item: mongoose.Types.ObjectId;
  claimant: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  message: string;
  proofDescription: string;
  adminNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClaimSchema = new Schema<IClaim>(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    claimant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    proofDescription: {
      type: String,
      required: [true, "Proof description is required"],
      trim: true,
      maxlength: [1000, "Proof description cannot exceed 1000 characters"],
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

ClaimSchema.index({ item: 1, claimant: 1 }, { unique: true });
ClaimSchema.index({ status: 1 });
ClaimSchema.index({ createdAt: -1 });

export const Claim = models.Claim || model<IClaim>("Claim", ClaimSchema);
