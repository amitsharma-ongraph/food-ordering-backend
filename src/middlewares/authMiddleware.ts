import { NextFunction, Request, Response } from "express";
import passport from "passport";

export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //@ts-ignore
  const isLoggedIn: boolean = req.isAuthenticated() && req.user ? true : false;
  if (isLoggedIn) {
    next();
  } else {
    return res.status(200).send({
      success: false,
      message: "not authorized",
    });
  }
};
