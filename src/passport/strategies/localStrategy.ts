import { Strategy } from "passport-local";
import User from "../../models/user";

export const localStrategy = new Strategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ email: username });
    if (!user) {
      return done(null, false, { message: "Incorrect email." });
    }
    if (user.isGoogleId()) {
      return done(null, false, {
        message: "Please try signing in using your google Id",
      });
    }
    const isValidPassword = await user.isValidPassword(password);

    if (!isValidPassword) {
      return done(null, false, { message: "Incorrect password." });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
});
