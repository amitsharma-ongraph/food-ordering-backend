import { Model } from "mongoose";
import { IUser } from "../Schema/IUsers";
import { IUserMethods } from "../InstanceMethods/IUserMethods";

export type UserModel = Model<IUser, {}, IUserMethods>;
