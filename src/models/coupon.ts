import mongoose, { Schema, model } from "mongoose";
import { ICoupon } from "../../types/Schema/ICoupon";
import { CouponModel } from "../../types/Models/CouponModel";

const CouponSchema = new Schema<ICoupon, CouponModel>({
  restroId: {
    type: mongoose.Types.ObjectId,
    ref: "restaurant",
    required: true,
  },
  code: { type: String, required: true },
  redemptions: { type: Number },
  availed: { type: Number, required: true, default: 0 },
  type: { type: String, required: true },
  discount: { type: Number },
  giftItemId: { type: String },
  condition: { type: String, required: true },
  combination: [String],
  billAmount: { type: Number },
  activated: { type: Boolean, required: true, default: false },
  isPublic: { type: Boolean, required: true, default: false },
  upto: { type: Number },
  limited: { type: Boolean, required: true, default: false },
});

const Coupon = model<ICoupon, CouponModel>("coupon", CouponSchema);

export default Coupon;
