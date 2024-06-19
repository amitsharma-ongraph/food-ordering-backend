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
exports.CouponRouter = void 0;
const express_1 = require("express");
const coupons_1 = require("../utils/coupons");
const coupon_1 = __importDefault(require("../models/coupon"));
const restaurant_1 = __importDefault(require("../models/restaurant"));
exports.CouponRouter = (0, express_1.Router)();
exports.CouponRouter.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isRandom, coupon } = req.body;
    let newCoupon = Object.assign({}, coupon);
    const allCoupons = yield coupon_1.default.find().lean();
    if (allCoupons.some((coupon) => coupon.code == newCoupon.code)) {
        return res.status(200).send({
            success: false,
            message: "Coupon with this code already exists",
        });
    }
    if (isRandom) {
        let code;
        let found = false;
        while (!found) {
            code = (0, coupons_1.getRandomCode)() + (coupon.discount ? coupon.discount : "");
            if (!allCoupons.some((coupon) => coupon.code == code)) {
                newCoupon.code = code;
                found = true;
            }
        }
    }
    try {
        const createdCoupon = new coupon_1.default(newCoupon);
        yield createdCoupon.save();
        return res.status(200).send({
            success: true,
            message: "coupon created",
        });
    }
    catch (error) {
        console.log("errror occured->", error);
        return res.status(500);
    }
}));
exports.CouponRouter.get("/restaurant/get-all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.session.passport.user;
    const restro = yield restaurant_1.default.findOne({ ownerId: userId });
    if (!restro) {
        return res.status(200).send({
            success: false,
            message: "couldn't authenticate",
        });
    }
    const restroId = restro._id;
    try {
        const coupons = yield coupon_1.default.find({
            restroId,
        });
        if (!coupons) {
            return res.status(200).send({
                success: false,
                message: "No Coupons Found",
            });
        }
        return res.status(200).send({
            success: true,
            coupons,
        });
    }
    catch (error) {
        return res.status(500);
    }
}));
exports.CouponRouter.post("/restaurant/toogle", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { couponId } = req.body;
        const coupon = yield coupon_1.default.findById(couponId);
        if (!coupon) {
            return res.status(200).send({
                success: false,
                message: "coupon not found",
            });
        }
        coupon.activated = !coupon.activated;
        yield coupon.save();
        return res.status(200).send({
            success: true,
        });
    }
    catch (error) {
        return res.status(500);
    }
}));
exports.CouponRouter.delete("/restaurant/delete/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log("coupon to delete", id);
        yield coupon_1.default.findByIdAndDelete(id);
        return res.status(200).send({
            success: true,
        });
    }
    catch (error) {
        return res.status(500);
    }
}));
