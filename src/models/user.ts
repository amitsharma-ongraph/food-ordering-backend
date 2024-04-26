import mongoose, { HydratedDocument, Model, Schema, model } from "mongoose";
import { IUser } from "../../types/Schema/IUsers";
import { UserModel } from "../../types/Models/UserModel";
import { IUserMethods } from "../../types/InstanceMethods/IUserMethods";
import bcrypt from "bcrypt";

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
  addressLine1: {
    type: String,
  },
  city: {
    type: String,
  },
  country: {
    type: String,
  },
});

userSchema.method("isValidPassword", async function isValidPassword(password) {
  const userPassword: string = this.password as string;
  const isValidPassword = await bcrypt.compare(password, userPassword);
  console.log("isValidPassword", isValidPassword);
  return isValidPassword;
});

userSchema.method("isGoogleId", function isGoogleId() {
  return this.googleId ? true : false;
});

const User = mongoose.model<IUser, UserModel>("User", userSchema);

export default User;
