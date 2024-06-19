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
exports.OrderRouter = void 0;
const express_1 = require("express");
const user_1 = __importDefault(require("../models/user"));
const restaurant_1 = __importDefault(require("../models/restaurant"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const order_1 = __importDefault(require("../models/order"));
const OrderStatus_1 = require("../../enums/OrderStatus");
const OptimalDelivery_1 = require("../utils/OptimalDelivery");
const MapRoute_1 = require("../utils/MapRoute");
const package_1 = __importDefault(require("../models/package"));
const coupon_1 = __importDefault(require("../models/coupon"));
const DiscountType_1 = require("../../enums/DiscountType");
const coupons_1 = require("../utils/coupons");
exports.OrderRouter = (0, express_1.Router)();
exports.OrderRouter.post("/bill", authMiddleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { restaurantId, userAddress, couponCode } = req.body;
    try {
        //@ts-ignore
        const userId = req.session.passport.user;
        const user = yield user_1.default.findById(userId);
        const restaurant = yield restaurant_1.default.findById(restaurantId);
        if (!user || !restaurant) {
            return res.status(200).send({
                success: false,
                message: "Can't fetch account at this moment",
            });
        }
        const cart = user.carts.find((c) => c.restaurantId.toString() === restaurantId);
        if (!cart) {
            return res.status(200).send({
                success: false,
                message: "couldn't access the cart at this moment",
            });
        }
        const { deliveryAmount } = yield (0, OptimalDelivery_1.getOptimalDelivery)(userAddress, restaurant.outlets);
        if (deliveryAmount == null) {
            return res.status(200).send({
                success: false,
                message: "couldn't deliver to this address",
            });
        }
        const itemBill = cart.cartItems.reduce((bill, item) => {
            return bill + item.quantity * item.menuItem.price;
        }, 0);
        const gstAmount = 47.15;
        const platfromAmount = 5;
        const totalAmount = parseFloat((itemBill + gstAmount + deliveryAmount + platfromAmount).toFixed(2));
        let discount = 0;
        const coupon = yield coupon_1.default.findOne({
            code: couponCode,
            restroId: restaurantId,
        }).lean();
        const couponResponse = (0, coupons_1.getCouponResponse)(coupon, cart, restaurant.menuItems);
        const { appliedCoupon } = couponResponse;
        if (appliedCoupon) {
            if (appliedCoupon.type === DiscountType_1.DiscountType.FLAT && appliedCoupon.discount) {
                discount = appliedCoupon.discount;
            }
            else if (appliedCoupon.type === DiscountType_1.DiscountType.PERCENTAGE &&
                appliedCoupon.discount) {
                discount = (itemBill * appliedCoupon.discount) / 100;
                if (discount > appliedCoupon.upto) {
                    discount = appliedCoupon.upto;
                }
            }
        }
        const bill = {
            itemToatal: itemBill,
            gst: gstAmount,
            delivery: deliveryAmount,
            platfrom: platfromAmount,
            grandTotal: totalAmount,
            discount,
            roundOff: parseFloat((totalAmount - discount - Math.floor(totalAmount - discount)).toFixed(2)),
            toPay: Math.floor(totalAmount - discount),
        };
        return res.status(200).send({
            success: true,
            bill,
            couponResponse: couponCode ? couponResponse : undefined,
        });
    }
    catch (error) {
        return res.status(500).send({
            success: false,
        });
    }
}));
exports.OrderRouter.post("/place", authMiddleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { restaurantId, userAddressId, note, couponCode } = req.body;
    try {
        //@ts-ignore
        const userId = req.session.passport.user;
        const user = yield user_1.default.findById(userId);
        const restaurant = yield restaurant_1.default.findById(restaurantId);
        if (!user || !restaurant) {
            return res.status(200).send({
                success: false,
                message: "Can't fetch account at this moment",
            });
        }
        const userAddress = user.addressList.find(
        //@ts-ignore
        (address) => address._id.toString() === userAddressId);
        if (!userAddress) {
            return res.status(200).send({
                success: false,
                message: "Couldn't delivery to this address",
            });
        }
        const { deliveryOutlet, deliveryAmount } = yield (0, OptimalDelivery_1.getOptimalDelivery)(userAddress, restaurant.outlets);
        if (!deliveryOutlet || !deliveryAmount) {
            return res.status(200).send({
                success: false,
                message: "Couldn't deliver to this address",
            });
        }
        const restroAddress = deliveryOutlet;
        const cart = user.carts.find((c) => c.restaurantId.toString() === restaurantId);
        if (!cart) {
            return res.status(200).send({
                success: false,
                message: "couldn't access the cart at this moment",
            });
        }
        const items = cart.cartItems;
        const itemBill = cart.cartItems.reduce((bill, item) => {
            return bill + item.quantity * item.menuItem.price;
        }, 0);
        const gstAmount = 47.15;
        const platfromAmount = 5;
        const totalAmount = parseFloat((itemBill + gstAmount + deliveryAmount + platfromAmount).toFixed(2));
        let discount = 0;
        const coupon = yield coupon_1.default.findOne({
            code: couponCode,
            restroId: restaurantId,
        });
        const couponResponse = (0, coupons_1.getCouponResponse)(coupon, cart, restaurant.menuItems);
        const { appliedCoupon } = couponResponse;
        if (appliedCoupon) {
            if (appliedCoupon.type === DiscountType_1.DiscountType.FLAT && appliedCoupon.discount) {
                discount = appliedCoupon.discount;
            }
            else if (appliedCoupon.type === DiscountType_1.DiscountType.PERCENTAGE &&
                appliedCoupon.discount) {
                discount = (itemBill * appliedCoupon.discount) / 100;
                if (discount > appliedCoupon.upto) {
                    discount = appliedCoupon.upto;
                }
            }
        }
        const bill = {
            itemToatal: itemBill,
            gst: gstAmount,
            delivery: deliveryAmount,
            platfrom: platfromAmount,
            grandTotal: totalAmount,
            discount,
            roundOff: parseFloat((totalAmount - discount - Math.floor(totalAmount - discount)).toFixed(2)),
            toPay: Math.floor(totalAmount - discount),
        };
        if (couponResponse.freeItem) {
            const freeItem = couponResponse.freeItem;
            freeItem.price = 0;
            items.push({ quantity: 1, menuItem: freeItem });
        }
        const order = new order_1.default({
            restroId: restaurantId,
            userId,
            bill,
            items,
            userAddress,
            restroAddress,
            status: OrderStatus_1.OrderStatus.Placed,
            note,
            timeline: {
                placed: new Date().toLocaleString(undefined, {
                    timeZone: "Asia/Kolkata",
                }),
            },
        });
        yield order.save();
        if (coupon) {
            coupon.availed += 1;
            yield coupon.save();
        }
        const newCarts = user.carts.filter((c) => c.restaurantId !== cart.restaurantId);
        yield user_1.default.findByIdAndUpdate(userId, {
            carts: newCarts,
        });
        return res.status(200).send({
            success: true,
            message: "Order Placed Successfully",
            order,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
        });
    }
}));
exports.OrderRouter.get("/restaurant/get-all", authMiddleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const ownerId = req.session.passport.user;
        const restaurant = yield restaurant_1.default.findOne({ ownerId });
        if (!restaurant) {
            return res.status(200).send({
                success: false,
                message: "can't find your restaurant",
            });
        }
        const restroId = restaurant._id;
        const orders = yield order_1.default.find({ restroId })
            .sort({ createdAt: -1 })
            .populate("userId");
        const orderList = orders.map((order) => {
            return {
                id: order._id,
                //@ts-ignore
                restroAddress: order.restroAddress,
                items: order.items,
                bill: order.bill,
                status: order.status,
                note: order.note,
                timeline: order.timeline,
                restroId,
                userAddress: Object.assign({ 
                    //@ts-ignore
                    name: order.userId.name, 
                    //@ts-ignore
                    email: order.userId.email }, order.userAddress._doc),
                //@ts-ignore
                dateTime: order.createdAt,
            };
        });
        res.status(200).send({
            success: true,
            orderList,
        });
    }
    catch (error) {
        res.status(500).send({
            success: false,
        });
    }
}));
exports.OrderRouter.post("/change-status", authMiddleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId, restroId } = req.body;
        const status = req.body.status;
        //@ts-ignore
        const userId = req.session.passport.user;
        const restaurant = yield restaurant_1.default.findById(restroId);
        if (!restaurant) {
            return res.status(200).send({
                success: false,
                message: "can't access the account",
            });
        }
        if (restaurant.ownerId.toString() !== userId) {
            return res.status(200).send({
                success: false,
                message: "unauhtorized access",
            });
        }
        const order = yield order_1.default.findById(orderId);
        if (!order) {
            return res.status(200).send({
                success: false,
                message: "Error while updating the status",
            });
        }
        const dateString = new Date().toLocaleString(undefined, {
            timeZone: "Asia/Kolkata",
        });
        order.status = status;
        order.timeline = Object.assign(Object.assign({}, order.timeline), { accepted: status === OrderStatus_1.OrderStatus.Accepted
                ? dateString
                : order.timeline[OrderStatus_1.OrderStatus.Accepted], preparing: status === OrderStatus_1.OrderStatus.Preparing
                ? dateString
                : order.timeline[OrderStatus_1.OrderStatus.Preparing], ready: status === OrderStatus_1.OrderStatus.Ready
                ? dateString
                : order.timeline[OrderStatus_1.OrderStatus.Ready], out_for_delivery: status === OrderStatus_1.OrderStatus.Out
                ? dateString
                : order.timeline[OrderStatus_1.OrderStatus.Out], delivered: status === OrderStatus_1.OrderStatus.Delivered
                ? dateString
                : order.timeline[OrderStatus_1.OrderStatus.Delivered], rejected: status === OrderStatus_1.OrderStatus.Rejected
                ? dateString
                : order.timeline[OrderStatus_1.OrderStatus.Rejected] });
        order.save();
        if (status === OrderStatus_1.OrderStatus.Out) {
            const routeCoords = yield (0, MapRoute_1.getRoute)(order.restroAddress, order.userAddress);
            const totalPoints = routeCoords === null || routeCoords === void 0 ? void 0 : routeCoords.length;
            const newPackage = new package_1.default({
                orderId,
                waypoints: routeCoords,
                index: 0,
                totalPoints,
            });
            yield newPackage.save();
        }
        const timeline = order.timeline;
        let sortedTimeline;
        const entries = Object.entries(timeline);
        entries.sort((a, b) => new Date(a[1]).getTime() - new Date(b[1]).getTime());
        sortedTimeline = Object.fromEntries(entries);
        return res.status(200).send({
            success: true,
            status: order.status,
            timeline: sortedTimeline,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
        });
    }
}));
exports.OrderRouter.get("/user/get-all", authMiddleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.session.passport.user;
        const orders = yield order_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .populate("userId")
            .populate("restroId");
        const orderList = orders.map((order) => {
            return {
                id: order._id,
                restroAddress: Object.assign(Object.assign({}, order.restroAddress._doc), { 
                    //@ts-ignore
                    name: order.restroId.name }),
                items: order.items,
                bill: order.bill,
                status: order.status,
                note: order.note,
                timeline: order.timeline,
                //@ts-ignore
                restroId: order.restroId._id,
                userAddress: Object.assign({ 
                    //@ts-ignore
                    name: order.userId.name, 
                    //@ts-ignore
                    email: order.userId.email }, order.userAddress._doc),
                //@ts-ignore
                dateTime: order.createdAt,
            };
        });
        res.status(200).send({
            success: true,
            orderList,
        });
    }
    catch (error) {
        res.status(500).send({
            success: false,
        });
    }
}));
exports.OrderRouter.get("/tracking/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const order = yield order_1.default.findById(id).populate("restroId");
        const { name } = order === null || order === void 0 ? void 0 : order.restroId;
        const trackingInfo = yield package_1.default.findOne({ orderId: id });
        return res.status(200).send({
            success: true,
            trackingInfo,
            orderInfo: {
                restroName: name,
            },
        });
    }
    catch (error) {
        console.log("errrror-->", error);
        return res.status(500).send({
            success: false,
        });
    }
}));
exports.OrderRouter.get("/livePosition/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const orderPackage = yield package_1.default.findById(id);
        return res.status(200).send({
            success: true,
            liveIndex: orderPackage === null || orderPackage === void 0 ? void 0 : orderPackage.index,
        });
    }
    catch (error) {
        console.log("errrror-->", error);
        return res.status(500).send({
            success: false,
        });
    }
}));
