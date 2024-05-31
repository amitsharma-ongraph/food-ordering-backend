import express, { Request, Response, Router, response } from "express";
import passport from "../passport/passport-config";
import { isAdmin, isLoggedIn } from "../middlewares/authMiddleware";
import User from "../models/user";
import bcrypt from "bcrypt";

const authRouter: Router = express.Router();

authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/user.phonenumbers.read",
    ],
  })
);
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: process.env.CLIENT_URL || "http://localhost:3000",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

authRouter.get("/login/failed", async (req: Request, res: Response) => {
  res.status(401).send({
    success: false,
  });
});

authRouter.get("/logout", async (req, res) => {
  try {
    req.logOut(() => {});
    return res.send({
      success: true,
      message: "logout success",
    });
  } catch (error) {
    return res.send({
      success: false,
      message: "logout faild",
    });
  }
});

authRouter.get("/authenticate", isLoggedIn, async (req, res) => {
  res.status(200).send({
    success: true,
    //@ts-ignore
    userId: req.session.passport.user,
  });
});

authRouter.post("/login", async (req: Request, res: Response, next) => {
  await passport.authenticate(
    "local",
    async (err: any, user: any, info: any) => {
      if (err) {
        return res
          .status(500)
          .json({ sucess: false, message: "Internal server error" });
      }
      if (!user) {
        return res.status(200).json({ success: false, message: info.message });
      }
      await req.login(user, (err) => {
        if (err) {
          return res.status(200).send({
            success: false,
            message: "Errror while setting up the user session",
          });
        }
      });
      res.status(200).json({ success: true, message: "Login successful" });
    }
  )(req, res, next);
});

authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name, contactNo } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      contactNo,
    });
    await newUser.save();

    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

authRouter.get("/isAdmin", isAdmin, async (req: Request, res: Response) => {
  return res.status(200).send({
    success: true,
  });
});
export default authRouter;
