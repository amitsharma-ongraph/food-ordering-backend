import mongoose from "mongoose";
import { ICart } from "../../types/Schema/ICart";
import { cartItemSchema } from "./cartItemSchema";

export const cartSchema = new mongoose.Schema<ICart>({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  cartItems: [cartItemSchema],
});
