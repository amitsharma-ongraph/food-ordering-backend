import mongoose from "mongoose";
import { menuItemSchema } from "../schema/menuItemSchema";
import { addressSchema } from "../schema/addressSchema";
import { IRestaurant } from "../../types/Schema/IRestaurant";
import { RestaurantModel } from "../../types/Models/RestaurantModel";

const restaurantSchema = new mongoose.Schema<IRestaurant, RestaurantModel>({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  outlets: [addressSchema],
  cuisins: [{ type: String, required: true }],
  menuItems: [menuItemSchema],
  logoUrl: { type: String, required: true },
  status: { type: String, required: true },
  menuGroups: [{ type: String, required: true }],
  ratings: { type: String },
});

const Restaurant = mongoose.model<IRestaurant, RestaurantModel>(
  "Restaurant",
  restaurantSchema
);

export default Restaurant;
