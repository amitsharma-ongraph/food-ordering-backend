import { Request, Response, Router } from "express";
import { HydratedDocument } from "mongoose";
import { IUser } from "../../types/Schema/IUsers";
import User from "../models/user";

export const userRouter: Router = Router();

userRouter.post("/details", async (req: Request, res: Response) => {
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
    const { _id, name, email } = user;
    return res.status(200).send({
      success: true,
      message: "user details fetched successfully",
      user: {
        id: _id,
        name,
        email,
      },
    });
  }
});
