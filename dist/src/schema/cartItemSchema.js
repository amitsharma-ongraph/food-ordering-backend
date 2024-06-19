"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartItemSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const menuItemSchema_1 = require("./menuItemSchema");
exports.cartItemSchema = new mongoose_1.default.Schema({
    quantity: { type: Number, required: true },
    menuItem: { type: menuItemSchema_1.menuItemSchema },
});
