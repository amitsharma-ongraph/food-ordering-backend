import mongoose, { Schema } from "mongoose";
import { IPackage } from "../../types/Schema/IPackage";
import { PackageModel } from "../../types/Models/PackageModel";

const packageSchema = new Schema<IPackage, PackageModel>({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  waypoints: [[Number]],
  index: Number,
  totalPoints: Number,
});

const Package = mongoose.model<IPackage, PackageModel>(
  "package",
  packageSchema
);

export default Package;
