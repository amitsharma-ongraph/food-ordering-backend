import { ObjectId } from "mongoose";
import { ICartItem } from "./ICartItem";

export interface ICart extends Document {
  restaurantId: ObjectId;
  cartItems: ICartItem[];
}
