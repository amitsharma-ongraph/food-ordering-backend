import { Request, Response, Router } from "express";
import { getRandomCode } from "../utils/coupons";
import Coupon from "../models/coupon";
import Restaurant from "../models/restaurant";

export const CouponRouter = Router();

CouponRouter.post("/create", async (req: Request, res: Response) => {
  const { isRandom, coupon } = req.body;
  let newCoupon = { ...coupon };
  const allCoupons = await Coupon.find().lean();
  if (allCoupons.some((coupon) => coupon.code == newCoupon.code)) {
    return res.status(200).send({
      success: false,
      message: "Coupon with this code already exists",
    });
  }
  if (isRandom) {
    let code: string;
    let found = false;
    while (!found) {
      code = getRandomCode() + (coupon.discount ? coupon.discount : "");
      if (!allCoupons.some((coupon) => coupon.code == code)) {
        newCoupon.code = code;
        found = true;
      }
    }
  }
  try {
    const createdCoupon = new Coupon(newCoupon);
    await createdCoupon.save();
    return res.status(200).send({
      success: true,
      message: "coupon created",
    });
  } catch (error) {
    console.log("errror occured->", error);
    return res.status(500);
  }
});

CouponRouter.get("/restaurant/get-all", async (req: Request, res: Response) => {
  //@ts-ignore
  const userId = req.session.passport.user;
  const restro = await Restaurant.findOne({ ownerId: userId });
  if (!restro) {
    return res.status(200).send({
      success: false,
      message: "couldn't authenticate",
    });
  }
  const restroId = restro._id;
  try {
    const coupons = await Coupon.find({
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
  } catch (error) {
    return res.status(500);
  }
});

CouponRouter.post("/restaurant/toogle", async (req: Request, res: Response) => {
  try {
    const { couponId } = req.body;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(200).send({
        success: false,
        message: "coupon not found",
      });
    }
    coupon.activated = !coupon.activated;
    await coupon.save();
    return res.status(200).send({
      success: true,
    });
  } catch (error) {
    return res.status(500);
  }
});

CouponRouter.delete(
  "/restaurant/delete/:id",
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await Coupon.findByIdAndDelete(id);
      return res.status(200).send({
        success: true,
      });
    } catch (error) {
      return res.status(500);
    }
  }
);
