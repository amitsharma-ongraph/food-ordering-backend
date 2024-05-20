import express, { Express, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import passport from "./passport/passport-config";
import authRouter from "./routes/AuthRoutes";
import cookieSession from "cookie-session";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/UserRoutes";
import restroRouter from "./routes/restroRoutes";
import { AdminRouter } from "./routes/AdminRoutes";
import SearchRouter from "./routes/SearchRoutes";
import { mapstyle } from "./constants/mapstyle";
import { CartRouter } from "./routes/CartRoutes";

const app: Express = express();

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || ""],
    maxAge: 24 * 60 * 60 * 1000,
    secure: false,
  })
);

app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/restaurant", restroRouter);
app.use("/api/admin", AdminRouter);
app.use("/api/search", SearchRouter);
app.use("/api/cart",CartRouter)

app.get("/test", async (req: Request, res: Response) => {
  res.status(200).send({
    success: true,
  });
});

app.get("/mapstyle", async (req: Request, res: Response) => {
  res.status(200).send(mapstyle);
});

mongoose.connect(process.env.DB_URI as string).then(() => {
  mongoose.connection.useDb("foodOrdering");
  console.log("connneted");
  app.listen(5000, () => {
    console.log("server started");
  });
});
