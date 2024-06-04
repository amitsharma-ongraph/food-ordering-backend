import mongoose from "mongoose";
import { IAddress } from "../../types/Schema/IAddress";

 const addressSchema = new mongoose.Schema<IAddress>({
  addressLine: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: { type: String, required: true },
  isPrimary: { type: Boolean },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default:"Point"
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

addressSchema.index({ location: '2dsphere' });

export  default addressSchema
