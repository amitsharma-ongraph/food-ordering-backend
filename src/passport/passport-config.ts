import passport from "passport";

import { googleStrategy } from "./strategies";
import User from "../models/user";
import { localStrategy } from "./strategies/localStrategy";

passport.use(googleStrategy);
passport.use(localStrategy);

passport.serializeUser((user: any, done) => {
  console.log("serializing user");
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
export default passport;
