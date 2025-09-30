import mongoose from "mongoose";
import { UserDocument } from "./user.model";

export interface SubscriptionInput {
  name: string;
  amount: number;
  category: string;
  billing_cycle: string;
  next_due_date: Date;
  vendor_website?: string;
  notes?: string;
}

export interface SubscriptionDocument extends SubscriptionInput, mongoose.Document {
  user: UserDocument["_id"];
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "entertainment",
        "music",
        "productivity",
        "development",
        "storage",
        "fitness",
        "education",
        "news",
        "business",
        "other"
      ]
    },
    billing_cycle: {
      type: String,
      required: true,
      enum: ["monthly", "yearly", "weekly", "quarterly"]
    },
    next_due_date: { type: Date, required: true },
    vendor_website: { type: String },
    notes: { type: String }
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ user: 1, next_due_date: 1 });

const SubscriptionModel = mongoose.model<SubscriptionDocument>("Subscription", subscriptionSchema);

export default SubscriptionModel;