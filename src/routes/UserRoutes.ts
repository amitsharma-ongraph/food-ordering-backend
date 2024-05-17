import { Request, Response, Router } from "express";
import { HydratedDocument } from "mongoose";
import { IUser } from "../../types/Schema/IUsers";
import User from "../models/user";
import { IAddress } from "../../types/Schema/IAddress";

export const userRouter: Router = Router();

userRouter.post("/details", async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
  //@ts-ignore
  if (id !== req.session.passport.user) {
    return res.status(200).send({
      success: false,
      message: "Invalid user",
    });
  }
  const user: HydratedDocument<IUser> | null = await User.findById(id);
  if (!user) {
    return res.status(200).send({
      success: false,
      message: "user not found",
    });
  }
  if (user) {
    const { _id, name, email, contactNo, addressList } = user;
    return res.status(200).send({
      success: true,
      message: "user details fetched successfully",
      user: {
        id: _id,
        name,
        email,
        contactNo,
        addressList,
      },
    });
  }
  } catch (error) {
    return res.status(200).send({
      success: false,
      message: "user not found",
    });
  }
  
});

userRouter.post("/add-address", async (req: Request, res: Response) => {
  const {
    id,
    address: { city, country, zipCode, addressLine, isPrimary },
  } = req.body;
  try {
    const updatedUser: IUser | null = await User.findByIdAndUpdate(
      id,
      {
        $push: {
          addressList: {
            city,
            country,
            zipCode,
            addressLine,
            isPrimary,
          },
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const { _id: addressId } = updatedUser.addressList[
      updatedUser.addressList.length - 1
    ] as any;
    return res.status(201).send({
      success: true,
      message: "Address Added Succesfully",
      addressId,
    });
  } catch (error) {
    return res.status(500);
  }
});

userRouter.post(
  "/address/mark-primary",
  async (req: Request, res: Response) => {
    const { addressId, userId } = req.body;
    try {
      const { addressList }: HydratedDocument<IUser> = await User.findById(
        userId
      ).select("addressList");
      if (!addressList) {
        return res.status(200).send({
          success: false,
        });
      }
      const updatedAddressList = addressList.map((address: any) => ({
        ...address._doc,
        isPrimary: address._id.toString() === addressId,
      }));
      const updatedUser = await User.findByIdAndUpdate(userId, {
        $set: { addressList: updatedAddressList },
      });
      if (!updatedUser) {
        return res.status(200).send({
          success: "false",
        });
      }

      return res.status(200).send({
        success: true,
      });
    } catch (error) {
      return res.status(500);
    }
  }
);
