import mongoose, { HydratedDocument, Model, Schema, model } from "mongoose";
import { IUser } from "../../types/Schema/IUsers";
import { UserModel } from "../../types/Models/UserModel";
import { IUserMethods } from "../../types/InstanceMethods/IUserMethods";
import bcrypt from "bcrypt";
import addressSchema  from "../schema/addressSchema";
import { cartSchema } from "../schema/cartSchema";

export const userSchema: Schema = new mongoose.Schema<
  IUser,
  UserModel,
  IUserMethods
>({
  googleId: {
    type: String,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  addressList: [addressSchema],
  contactNo: {
    type: String,
  },
  carts: [cartSchema],
  verified:{type:Boolean,default:false}
});

userSchema.method("isValidPassword", async function isValidPassword(password) {
  const userPassword: string = this.password as string;
  const isValidPassword = await bcrypt.compare(password, userPassword);

  return isValidPassword;
});

userSchema.method("isGoogleId", function isGoogleId() {
  return this.googleId ? true : false;
});

const User = mongoose.model<IUser, UserModel>("User", userSchema);

export default User;
