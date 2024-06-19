"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCouponResponse = exports.getRandomCode = void 0;
const DiscountCondition_1 = require("../../enums/DiscountCondition");
const DiscountType_1 = require("../../enums/DiscountType");
const getRandomCode = () => {
    const chars = "QWERTYUIOPASDFGHJKLZXCVBNM";
    let code = "";
    for (let i = 0; i < 7; i++) {
        code += chars[Math.floor(Math.random() * 25)];
    }
    return code;
};
exports.getRandomCode = getRandomCode;
const getCouponResponse = (coupon, cart, menuItems) => {
    if (!coupon) {
        return {
            success: false,
            error: "Invalid Coupon Code",
        };
    }
    if (coupon.redemptions && coupon.redemptions - coupon.availed < 1) {
        return {
            success: false,
            error: "Coupon limit reached",
        };
    }
    const itemTotal = cart.cartItems.reduce((bill, item) => {
        return bill + item.quantity * item.menuItem.price;
    }, 0);
    if (coupon.billAmount &&
        coupon.condition === DiscountCondition_1.DiscountCondition.AMOUNT &&
        itemTotal < coupon.billAmount) {
        return {
            success: false,
            error: `please add item worth ${coupon.billAmount - itemTotal} more`,
        };
    }
    if (coupon.condition === DiscountCondition_1.DiscountCondition.COMBINATION &&
        coupon.combination) {
        let eligible = true;
        coupon.combination.forEach((itemId) => {
            const itemAdded = cart.cartItems.some((cartItem) => cartItem.menuItem.id == itemId);
            if (!itemAdded) {
                eligible = false;
            }
        });
        if (!eligible) {
            return {
                success: false,
                error: "Items in your cart are not eligible",
            };
        }
    }
    if (coupon.type === DiscountType_1.DiscountType.GIFT_ITEM) {
        const freeItems = menuItems.filter((menuItem) => menuItem.id == coupon.giftItemId);
        return {
            success: true,
            appliedCoupon: coupon,
            freeItem: freeItems[0],
        };
    }
    return {
        success: true,
        appliedCoupon: coupon,
    };
};
exports.getCouponResponse = getCouponResponse;
