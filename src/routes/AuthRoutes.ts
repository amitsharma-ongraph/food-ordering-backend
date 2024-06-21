import express, { Request, Response, Router, response } from "express";
import passport from "../passport/passport-config";
import { isAdmin, isLoggedIn } from "../middlewares/authMiddleware";
import User from "../models/user";
import bcrypt from "bcrypt";
import Restaurant from "../models/restaurant";
import { TwilioClient } from "../twilio";

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
    successRedirect: process.env.CLIENT_URL,
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
    cookies: req.cookies,
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
    const { email, password, name } = req.body;
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
      contactNo: null,
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

authRouter.post("/verification/role", async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.session.passport.user;

    if (!userId) {
      return res.status(200).send({
        success: false,
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).send({
        success: false,
      });
    }
    const restros: any = await Restaurant.find({ ownerId: userId }).populate(
      "ownerId"
    );
    const restro = restros[0];
    if (restro) {
      return res.status(200).send({
        success: true,
        role: "Restaurant",
      });
    }

    const isAdmin: boolean = userId === process.env.ADMIN_SECRET;
    if (isAdmin) {
      return res.status(200).send({
        success: true,
        role: "Admin",
      });
    }
    return res.status(200).send({
      success: true,
      role: "User",
    });
  } catch (error) {
    return res.status(200).send({
      success: false,
    });
  }
});

authRouter.get("/verification/contact", async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.session.passport.user;
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(200).send({
        success: false,
      });
    }
    const verfied = user.verified;
    if (verfied) {
      return res.status(200).send({
        success: true,
      });
    }
    return res.status(200).send({
      success: false,
    });
  } catch (error) {
    return res.status(200).send({
      success: false,
    });
  }
});

authRouter.post("/send-otp", async (req, res) => {
  const { phoneNumber } = req.body;
  const verifyServiceSid = process.env.TWILIO_SERVICE_SID || "";
  await TwilioClient.verify.v2
    .services(verifyServiceSid)
    .verifications.create({ to: `+91${phoneNumber}`, channel: "sms" })
    .then((verification) => res.status(200).send({ success: true }))
    .catch((error) => res.status(500).send({ success: false }));
});

authRouter.post("/verify-otp", async (req, res) => {
  //@ts-ignore
  const userId = req.session.passport.user;
  const { phoneNumber, otp } = req.body;
  const verifyServiceSid = process.env.TWILIO_SERVICE_SID || "";
  await TwilioClient.verify.v2
    .services(verifyServiceSid)
    .verificationChecks.create({ to: `+91${phoneNumber}`, code: otp })
    .then(async (verification_check) => {
      if (verification_check.status === "approved") {
        try {
          const user = await User.findByIdAndUpdate(userId, {
            contactNo: phoneNumber,
            verified: true,
          });
          console.log("user -->", user);
          if (!user) {
            throw new Error("user not found");
          }
          return res.status(200).send({
            success: true,
          });
        } catch (error) {
          console.log("user error->", error);
          return res.status(500);
        }
      } else {
        return res.status(200).send({
          success: false,
        });
      }
    })
    .catch((error) => {
      console.log("opt error ", error);
      return res.status(500).send(`Failed to verify OTP: ${error.message}`);
    });
});

export default authRouter;
