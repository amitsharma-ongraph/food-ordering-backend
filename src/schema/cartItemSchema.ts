import mongoose from "mongoose";
import { ICartItem } from "../../types/Schema/ICartItem";
import { menuItemSchema } from "./menuItemSchema";

export const cartItemSchema = new mongoose.Schema<ICartItem>({
  quantity: { type: Number, required: true },
  menuItem: { type: menuItemSchema },
});
