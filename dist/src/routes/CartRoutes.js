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
exports.CartRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const user_1 = __importDefault(require("../models/user"));
exports.CartRouter = (0, express_1.Router)();
exports.CartRouter.get("/get", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.session.passport.user;
    const user = yield user_1.default.findById(userId);
    if (!user) {
        return res.status(200).send({
            success: false,
            message: "couldn't fetch your cart at this moment"
        });
    }
    try {
        const cart = user.carts.reduce((map, item) => {
            map[item.restaurantId.toString()] = item.cartItems.map(item => ({
                quantity: item.quantity,
                menuItem: Object.assign(Object.assign({}, item.menuItem._doc), { id: item.menuItem.id })
            }));
            return map;
        }, {});
        return res.status(200).send({
            success: true,
            cart
        });
    }
    catch (error) {
        return res.status(500).send({
            success: false
        });
    }
}));
exports.CartRouter.post("/add", authMiddleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { restaurantId, menuItem } = req.body;
    //@ts-ignore
    const userId = req.session.passport.user;
    const user = yield user_1.default.findById(userId);
    try {
        if (!user) {
            return res.status(200).send({
                success: false,
                message: "Couldn't fetch account at this moment"
            });
        }
        const cart = user.carts.find(c => c.restaurantId.toString() === restaurantId);
        if (cart) {
            const cartItem = cart.cartItems.find(cartItem => cartItem.menuItem.id.toString() === menuItem.id);
            if (cartItem) {
                cartItem.quantity += 1;
            }
            else {
                cart.cartItems.push({
                    quantity: 1,
                    menuItem: Object.assign(Object.assign({}, menuItem), { _id: menuItem.id })
                });
                user.carts.map(userCart => userCart.restaurantId === cart.restaurantId ? cart : userCart);
            }
            user.save();
            return res.status(200).send({
                success: true,
                message: "Item Addedd Successfully"
            });
        }
        else {
            const newCart = {
                restaurantId,
                cartItems: [{ quantity: 1, menuItem: Object.assign(Object.assign({}, menuItem), { _id: menuItem.id }) }]
            };
            const updatedUser = yield user_1.default.findByIdAndUpdate(userId, {
                $push: {
                    carts: newCart
                }
            });
            if (updatedUser) {
                return res.status(200).send({
                    success: true,
                    message: "Item Added Successfully"
                });
            }
        }
    }
    catch (error) {
        console.log("error--->", error);
        return res.status(500).send({
            success: false
        });
    }
}));
exports.CartRouter.post("/remove", authMiddleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { restaurantId, menuItemId } = req.body;
    try {
        //@ts-ignore
        const userId = req.session.passport.user;
        const user = yield user_1.default.findById(userId);
        if (!user) {
            return res.status(200).send({
                success: false,
                message: "couldn't access cart details at this moment"
            });
        }
        const cart = user.carts.find(c => c.restaurantId.toString() === restaurantId);
        if (!cart) {
            return res.status(200).send({
                success: false,
                message: "couldn't access your cart at this moment"
            });
        }
        const cartItem = cart.cartItems.find(cartItem => cartItem.menuItem.id.toString() === menuItemId);
        if (!cartItem) {
            return res.status(200).send({
                success: false,
                message: "Invalid Item"
            });
        }
        if (cartItem.quantity === 1) {
            const newList = cart.cartItems.filter(item => item.menuItem.id.toString() !== menuItemId);
            if (newList.length === 0) {
                const newCarts = user.carts.filter(c => c.restaurantId !== cart.restaurantId);
                yield user_1.default.findByIdAndUpdate(userId, {
                    carts: newCarts
                });
                return res.status(200).send({
                    success: true
                });
            }
            else {
                cart.cartItems = newList;
            }
        }
        else {
            cartItem.quantity -= 1;
        }
        user.save();
        return res.status(200).send({
            success: true,
            message: "Item removed successfully"
        });
    }
    catch (error) {
        return res.status(500).send({
            success: false
        });
    }
}));
