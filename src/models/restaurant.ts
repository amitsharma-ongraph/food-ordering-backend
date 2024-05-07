import mongoose from "mongoose";
import { menuItemSchema } from "./menuItem";
import { addressSchema } from "./address";
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
});

const Restaurant = mongoose.model<IRestaurant, RestaurantModel>(
  "Restaurant",
  restaurantSchema
);

export default Restaurant;
