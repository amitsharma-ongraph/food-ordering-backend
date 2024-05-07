import { Document } from "mongoose";
import { IAddress } from "./IAddress";

export interface IUser extends Document {
  googleId: string;
  name: string;
  email: string;
  password: string;
  contactNo: string;
  addressList: IAddress[];
}
