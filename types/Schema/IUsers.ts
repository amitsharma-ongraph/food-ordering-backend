import { Document } from "mongoose";

export interface IUser extends Document {
  googleId: string;
  name: string;
  addressLine1: string;
  city: string;
  country: string;
  email: string;
  password: string;
}
