"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const CouponSchema = new mongoose_1.Schema({
    restroId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "restaurant",
        required: true,
    },
    code: { type: String, required: true },
    redemptions: { type: Number },
    availed: { type: Number, required: true, default: 0 },
    type: { type: String, required: true },
    discount: { type: Number },
    giftItemId: { type: String },
    condition: { type: String, required: true },
    combination: [String],
    billAmount: { type: Number },
    activated: { type: Boolean, required: true, default: false },
    isPublic: { type: Boolean, required: true, default: false },
    upto: { type: Number },
    limited: { type: Boolean, required: true, default: false },
});
const Coupon = (0, mongoose_1.model)("coupon", CouponSchema);
exports.default = Coupon;
