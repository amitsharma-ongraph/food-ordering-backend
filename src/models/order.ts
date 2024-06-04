import mongoose, { Schema } from "mongoose";
import { IOrder } from "../../types/Schema/IOrder";
import { OrderModel } from "../../types/Models/OrderModel";
import  addressSchema  from "../schema/addressSchema";
import { billSchema } from "../schema/billSchema";
import { cartItemSchema } from "../schema/cartItemSchema";

const orderSchema = new Schema<IOrder, OrderModel>(
  {
    restroAddress: { type: addressSchema, required: true },
    userAddress: { type: addressSchema, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    bill: { type: billSchema, required: true },
    items: [cartItemSchema],
    status: { type: String, required: true },
    note: { type: String },
    timeline: { type: Object },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder, OrderModel>("Order", orderSchema);

export default Order;
