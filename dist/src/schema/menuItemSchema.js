"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuItemSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.menuItemSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    groupName: { type: String, required: true },
    ratings: { type: String, required: true },
    totalReview: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
    totalOrders: { type: Number },
});
