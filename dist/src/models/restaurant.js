"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const menuItemSchema_1 = require("../schema/menuItemSchema");
const addressSchema_1 = __importDefault(require("../schema/addressSchema"));
const restaurantSchema = new mongoose_1.default.Schema({
    ownerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    outlets: [addressSchema_1.default],
    cuisins: [{ type: String, required: true }],
    menuItems: [menuItemSchema_1.menuItemSchema],
    logoUrl: { type: String, required: true },
    status: { type: String, required: true },
    menuGroups: [{ type: String, required: true }],
    ratings: { type: String },
    isVeg: { type: Boolean, default: false }
});
const Restaurant = mongoose_1.default.model("Restaurant", restaurantSchema);
exports.default = Restaurant;
