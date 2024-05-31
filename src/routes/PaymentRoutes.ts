import { Request, Response, Router } from "express";
import { razorpay } from "../razorpay";
import crypto from "crypto";

export const PaymentRouter = Router();

PaymentRouter.post("/create-order", async (req: Request, res: Response) => {
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
    razorpay.orders.create(options, function (err, order) {
      if (err) {
        console.log("error in razor pay", err);
      }
      return res.status(200).send({
        success: true,
        order,
      });
    });
  } catch (error) {
    res.status(500).send({
      success: false,
    });
  }
});

PaymentRouter.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = req.body;
    const sign = order_id + "|" + razorpay_payment_id;
    console.log("sign-->", sign);
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const resultSign = crypto
      .createHmac("sha256", secret)
      .update(sign.toString())
      .digest("hex");
    console.log("key secret", secret);
    console.log("result sign", resultSign);
    if (razorpay_signature == resultSign) {
      return res.status(200).send({
        success: true,
        message: "Payment Successfull",
      });
    }
    return res.status(500).send({
      success: false,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
    });
  }
});
