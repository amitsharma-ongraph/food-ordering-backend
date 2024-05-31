import { ObjectId } from "mongoose";

export interface IPackage {
  waypoints: [number, number][];
  totalPoints: number;
  index: number;
  orderId: ObjectId;
}
