"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRouter = void 0;
const express_1 = require("express");
const razorpay_1 = require("../razorpay");
const crypto_1 = __importDefault(require("crypto"));
exports.PaymentRouter = (0, express_1.Router)();
exports.PaymentRouter.post("/create-order", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { price } = req.body;
        if (!price)
            return res.status(200).send({
                success: false,
                message: "Price is required to create an order",
            });
        var options = {
            amount: price,
            currency: "INR",
            receipt: "order_rcptid_11",
        };
        razorpay_1.razorpay.orders.create(options, function (err, order) {
            if (err) {
                console.log("error in razor pay", err);
            }
            return res.status(200).send({
                success: true,
                order,
            });
        });
    }
    catch (error) {
        res.status(500).send({
            success: false,
        });
    }
}));
exports.PaymentRouter.post("/verify", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id, } = req.body;
        const sign = order_id + "|" + razorpay_payment_id;
        const secret = process.env.RAZORPAY_KEY_SECRET || "";
        const resultSign = crypto_1.default
            .createHmac("sha256", secret)
            .update(sign.toString())
            .digest("hex");
        if (razorpay_signature == resultSign) {
            return res.status(200).send({
                success: true,
                message: "Payment Successfull",
            });
        }
        return res.status(500).send({
            success: false,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
        });
    }
}));
