import { Request, Response, Router } from "express";
import User from "../models/user";
import Restaurant from "../models/restaurant";
import { isLoggedIn } from "../middlewares/authMiddleware";
import Order from "../models/order";
import { OrderStatus } from "../../enums/OrderStatus";
import { getOptimalDelivery } from "../utils/OptimalDelivery";
import { getRoute } from "../utils/MapRoute";
import Package from "../models/package";
import { IRestaurant } from "../../types/Schema/IRestaurant";

export const OrderRouter = Router();

OrderRouter.post("/bill", isLoggedIn, async (req: Request, res: Response) => {
  const { restaurantId, userAddress } = req.body;

  console.log("userAddress-->",userAddress)

  try {
    //@ts-ignore
    const userId = req.session.passport.user;
    const user = await User.findById(userId);
    const restaurant = await Restaurant.findById(restaurantId);
    if (!user || !restaurant) {
      return res.status(200).send({
        success: false,
        message: "Can't fetch account at this moment",
      });
    }
    const cart = user.carts.find(
      (c) => c.restaurantId.toString() === restaurantId
    );
    if (!cart) {
      return res.status(200).send({
        success: false,
        message: "couldn't access the cart at this moment",
      });
    }

    const { deliveryAmount } = await getOptimalDelivery(
      userAddress,
      restaurant.outlets
    );
    console.log("delivert charges-->", deliveryAmount);
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
    const totalAmount = parseFloat(
      (itemBill + gstAmount + deliveryAmount + platfromAmount).toFixed(2)
    );
    const bill = {
      itemToatal: itemBill,
      gst: gstAmount,
      delivery: deliveryAmount,
      platfrom: platfromAmount,
      grandTotal: totalAmount,
      roundOff: parseFloat((totalAmount - Math.floor(totalAmount)).toFixed(2)),
      toPay: Math.floor(totalAmount),
    };
    return res.status(200).send({
      success: true,
      bill,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
    });
  }
});

OrderRouter.post("/place", isLoggedIn, async (req: Request, res: Response) => {
  const { restaurantId, userAddressId, note } = req.body;
  try {
    //@ts-ignore
    const userId = req.session.passport.user;
    const user = await User.findById(userId);
    const restaurant = await Restaurant.findById(restaurantId);
    if (!user || !restaurant) {
      return res.status(200).send({
        success: false,
        message: "Can't fetch account at this moment",
      });
    }
    const userAddress = user.addressList.find(
      //@ts-ignore
      (address) => address._id.toString() === userAddressId
    );
    if (!userAddress) {
      return res.status(200).send({
        success: false,
        message: "Couldn't delivery to this address",
      });
    }

    const { deliveryOutlet, deliveryAmount } = await getOptimalDelivery(
      userAddress,
      restaurant.outlets
    );
    if (!deliveryOutlet || !deliveryAmount) {
      return res.status(200).send({
        success: false,
        message: "Couldn't deliver to this address",
      });
    }
    const restroAddress = deliveryOutlet;
    const cart = user.carts.find(
      (c) => c.restaurantId.toString() === restaurantId
    );
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
    const totalAmount = parseFloat(
      (itemBill + gstAmount + deliveryAmount + platfromAmount).toFixed(2)
    );
    const bill = {
      itemToatal: itemBill,
      gst: gstAmount,
      delivery: deliveryAmount,
      platfrom: platfromAmount,
      grandTotal: totalAmount,
      roundOff: parseFloat((totalAmount - Math.floor(totalAmount)).toFixed(2)),
      toPay: Math.floor(totalAmount),
    };
    const order = new Order({
      restroId: restaurantId,
      userId,
      bill,
      items,
      userAddress,
      restroAddress,
      status: OrderStatus.Placed,
      note,
      timeline: {
        placed: new Date().toLocaleString(undefined, {
          timeZone: "Asia/Kolkata",
        }),
      },
    });
    await order.save();
    const newCarts = user.carts.filter(
      (c) => c.restaurantId !== cart.restaurantId
    );
    await User.findByIdAndUpdate(userId, {
      carts: newCarts,
    });
    return res.status(200).send({
      success: true,
      message: "Order Placed Successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
    });
  }
});

OrderRouter.get(
  "/restaurant/get-all",
  isLoggedIn,
  async (req: Request, res: Response) => {
    try {
      //@ts-ignore
      const ownerId = req.session.passport.user;
      const restaurant = await Restaurant.findOne({ ownerId });
      if (!restaurant) {
        return res.status(200).send({
          success: false,
          message: "can't find your restaurant",
        });
      }
      const restroId = restaurant._id;
      const orders = await Order.find({ restroId }).sort({createdAt:-1}).populate("userId");

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
          userAddress: {
            //@ts-ignore
            name: order.userId.name,
            //@ts-ignore
            email: order.userId.email,
            //@ts-ignore
            ...order.userAddress._doc,
          },
          //@ts-ignore
          dateTime: order.createdAt,
        };
      });
      res.status(200).send({
        success: true,
        orderList,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
      });
    }
  }
);

OrderRouter.post(
  "/change-status",
  isLoggedIn,
  async (req: Request, res: Response) => {
    try {
      const { orderId, restroId } = req.body;
      const status = req.body.status as OrderStatus;
      //@ts-ignore
      const userId = req.session.passport.user;

      const restaurant = await Restaurant.findById(restroId);
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

      const order = await Order.findById(orderId);
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
      order.timeline = {
        ...order.timeline,
        accepted:
          status === OrderStatus.Accepted
            ? dateString
            : order.timeline[OrderStatus.Accepted],
        preparing:
          status === OrderStatus.Preparing
            ? dateString
            : order.timeline[OrderStatus.Preparing],
        ready:
          status === OrderStatus.Ready
            ? dateString
            : order.timeline[OrderStatus.Ready],
        out_for_delivery:
          status === OrderStatus.Out
            ? dateString
            : order.timeline[OrderStatus.Out],
        delivered:
          status === OrderStatus.Delivered
            ? dateString
            : order.timeline[OrderStatus.Delivered],
        rejected:
          status === OrderStatus.Rejected
            ? dateString
            : order.timeline[OrderStatus.Rejected],
      };
      order.save();
      if (status === OrderStatus.Out) {
        const routeCoords = await getRoute(
          order.restroAddress,
          order.userAddress
        );
        const totalPoints = routeCoords?.length;
        const newPackage = new Package({
          orderId,
          waypoints: routeCoords,
          index: 0,
          totalPoints,
        });
        await newPackage.save();
      }

      const timeline = order.timeline;
      let sortedTimeline;
      const entries = Object.entries(timeline);
      entries.sort(
        (a, b) => new Date(a[1]).getTime() - new Date(b[1]).getTime()
      );
      sortedTimeline = Object.fromEntries(entries);
      return res.status(200).send({
        success: true,
        status: order.status,
        timeline: sortedTimeline,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
      });
    }
  }
);

OrderRouter.get(
  "/user/get-all",
  isLoggedIn,
  async (req: Request, res: Response) => {
    try {
      //@ts-ignore
      const userId = req.session.passport.user;

      const orders = await Order.find({ userId }).sort({createdAt:-1})
        .populate("userId")
        .populate("restroId");

      const orderList = orders.map((order) => {
        return {
          id: order._id,

          restroAddress: {
            //@ts-ignore
            ...order.restroAddress._doc,
            //@ts-ignore
            name: order.restroId.name,
          },
          items: order.items,
          bill: order.bill,
          status: order.status,
          note: order.note,
          timeline: order.timeline,
          //@ts-ignore
          restroId: order.restroId._id,
          userAddress: {
            //@ts-ignore
            name: order.userId.name,
            //@ts-ignore
            email: order.userId.email,
            //@ts-ignore
            ...order.userAddress._doc,
          },
          //@ts-ignore
          dateTime: order.createdAt,
        };
      });
      res.status(200).send({
        success: true,
        orderList,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
      });
    }
  }
);

OrderRouter.get("/tracking/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const order = await Order.findById(id).populate("restroId");
    const { name } = order?.restroId as any;

    const trackingInfo = await Package.findOne({ orderId: id });
    return res.status(200).send({
      success: true,
      trackingInfo,
      orderInfo: {
        restroName: name,
      },
    });
  } catch (error) {
    console.log("errrror-->", error);
    return res.status(500).send({
      success: false,
    });
  }
});

OrderRouter.get("/livePosition/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const orderPackage = await Package.findById(id);
    return res.status(200).send({
      success: true,
      liveIndex: orderPackage?.index,
    });
  } catch (error) {
    console.log("errrror-->", error);
    return res.status(500).send({
      success: false,
    });
  }
});
