import { Strategy, VerifyCallback } from "passport-google-oauth20";
import "dotenv/config";
import User from "../../models/user";
import { IUser } from "../../../types/Schema/IUsers";
import { HydratedDocument } from "mongoose";

interface IConfig {
  clientId: string;
  clientSecret: string;
}

const config: IConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
};

const verifyCallback = async (
  accessToken: string,
  refreshToken: string,
  profile: any,
  done: VerifyCallback
) => {
  try {
    let existingUser: HydratedDocument<IUser> | null = await User.findOne({
      googleId: profile.id,
    });
    if (existingUser) {
      return done(null, existingUser);
    } else {
      const newUser: HydratedDocument<IUser> = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile._json.email,
        contactNo: "",
        addressList: [],
      });

      const savedUser = await newUser.save();

      return done(null, savedUser);
    }
  } catch (error: any) {
    return done(error);
  }
};

export const googleStrategy = new Strategy(
  {
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: "/api/auth/google/callback",
  },
  verifyCallback
);
