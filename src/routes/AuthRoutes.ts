import express, { Request, Response, Router, response } from "express";
import passport from "../passport/passport-config";
import { isLoggedIn } from "../middlewares/authMiddleware";
import User from "../models/user";
import bcrypt from "bcrypt";

const authRouter: Router = express.Router();

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "http://localhost:3000/",
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

// authRouter.post("/login", async (req: Request, res: Response, next) => {
//   await passport.authenticate("local", (err: any, user: any, info: any) => {
//     if (err) {
//       return res
//         .status(500)
//         .json({ sucess: false, message: "Internal server error" });
//     }
//     if (!user) {
//       return res.status(200).json({ success: false, message: info.message });
//     }

//     res.status(200).json({ sucess: true, message: "Login successful", user });
//   })(req, res, next);
// });

authRouter.post("/login", passport.authenticate("local"), (req, res) => {});

authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default authRouter;
