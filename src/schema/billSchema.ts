import { Schema } from "mongoose";
import { IBill } from "../../types/Schema/IBill";

export const billSchema = new Schema<IBill>({
  itemToatal: { type: Number, required: true },
  gst: { type: Number, required: true },
  delivery: { type: Number, required: true },
  platfrom: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  discount: { type: Number, required: true },
  roundOff: { type: Number, required: true },
  toPay: { type: Number, required: true },
});
