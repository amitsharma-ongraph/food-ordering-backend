import { NextFunction, Request, Response } from "express";
import passport from "passport";

export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //@ts-ignore
    const isLoggedIn: boolean =(req.isAuthenticated() && req.user!==undefined) ? true : false;
    if (isLoggedIn) {
      next();
    } else {
      return res.status(200).send({
        success: false,
        message: "not authorized",
      });
    }
  } catch (error) {
    return res.status(200).send({
      success: false,
      message: "not authorized",
    });
  }
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    //@ts-ignore
  if(!req.session?.passport?.user){
    return res.status(200).send({
      success: false,
      message: "not authorized",
    });
  }
  //@ts-ignore
  const isAdmin: boolean =  req.session.passport.user === process.env.ADMIN_SECRET;
  if (isAdmin) {
    next();
  } else {
    return res.status(200).send({
      success: false,
      message: "not authorized",
    });
  }
};
