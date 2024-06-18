import { ObjectId } from "mongodb";
import { DiscountCondition } from "../../enums/DiscountCondition";
import { ICart } from "../../types/Schema/ICart";
import { ICoupon } from "../../types/Schema/ICoupon";
import { DiscountType } from "../../enums/DiscountType";
import { IMenuItem } from "../../types/Schema/IMenuItem";

interface ICouponRespone {
  success: boolean;
  error?: string;
  appliedCoupon?: ICoupon;
  freeItem?: IMenuItem;
}

export const getRandomCode = () => {
  const chars = "QWERTYUIOPASDFGHJKLZXCVBNM";
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += chars[Math.floor(Math.random() * 25)];
  }
  return code;
};

export const getCouponResponse = (
  coupon: ICoupon | null,
  cart: ICart,
  menuItems: IMenuItem[]
): ICouponRespone => {
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
  if (
    coupon.billAmount &&
    coupon.condition === DiscountCondition.AMOUNT &&
    itemTotal < coupon.billAmount
  ) {
    return {
      success: false,
      error: `please add item worth ${coupon.billAmount - itemTotal} more`,
    };
  }
  if (
    coupon.condition === DiscountCondition.COMBINATION &&
    coupon.combination
  ) {
    let eligible = true;
    coupon.combination.forEach((itemId) => {
      const itemAdded = cart.cartItems.some(
        (cartItem) => cartItem.menuItem.id == (itemId as string)
      );
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
  if (coupon.type === DiscountType.GIFT_ITEM) {
    const freeItems = menuItems.filter(
      (menuItem) => menuItem.id == coupon.giftItemId
    );
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
