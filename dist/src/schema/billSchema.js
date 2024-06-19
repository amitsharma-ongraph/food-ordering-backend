"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billSchema = void 0;
const mongoose_1 = require("mongoose");
exports.billSchema = new mongoose_1.Schema({
    itemToatal: { type: Number, required: true },
    gst: { type: Number, required: true },
    delivery: { type: Number, required: true },
    platfrom: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    discount: { type: Number, required: true },
    roundOff: { type: Number, required: true },
    toPay: { type: Number, required: true },
});
