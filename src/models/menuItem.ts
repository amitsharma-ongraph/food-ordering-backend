import mongoose from "mongoose";
import { IMenuItem } from "../../types/Schema/IMenuItem";

export const menuItemSchema = new mongoose.Schema<IMenuItem>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  groupName: { type: String, required: true },
  ratings: { type: String, required: true },
  totalReview: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, required: true },
  totalOrders: { type: Number },
});
