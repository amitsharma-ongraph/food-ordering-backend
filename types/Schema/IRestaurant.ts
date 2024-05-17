import { ObjectId } from "mongoose";
import { IAddress } from "./IAddress";
import { IMenuItem } from "./IMenuItem";

export interface IRestaurant extends Document {
  ownerId: ObjectId;
  name: string;
  outlets: IAddress[];
  cuisins: string[];
  menuItems: IMenuItem[];
  logoUrl: string;
  status: "Approved" | "Pending" | "Rejected";
  menuGroups: string[];
  ratings:string
}
