import mongoose from "mongoose";
import { IAddress } from "../../types/Schema/IAddress";

export const addressSchema = new mongoose.Schema<IAddress>({
  addressLine: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: { type: String, required: true },
  isPrimary: { type: Boolean },
});
