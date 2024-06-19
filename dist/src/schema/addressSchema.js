"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const addressSchema = new mongoose_1.default.Schema({
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    isPrimary: { type: Boolean },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
});
addressSchema.index({ location: '2dsphere' });
exports.default = addressSchema;
