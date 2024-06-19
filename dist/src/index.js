"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const passport_config_1 = __importDefault(require("./passport/passport-config"));
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const UserRoutes_1 = require("./routes/UserRoutes");
const restroRoutes_1 = __importDefault(require("./routes/restroRoutes"));
const AdminRoutes_1 = require("./routes/AdminRoutes");
const SearchRoutes_1 = __importDefault(require("./routes/SearchRoutes"));
const mapstyle_1 = require("./constants/mapstyle");
const CartRoutes_1 = require("./routes/CartRoutes");
const orderRoutes_1 = require("./routes/orderRoutes");
const PaymentRoutes_1 = require("./routes/PaymentRoutes");
const CouponRoutes_1 = require("./routes/CouponRoutes");
const app = (0, express_1.default)();
app.use((0, cookie_session_1.default)({
    name: "session",
    keys: [process.env.SESSION_SECRET || "default_secret"],
    maxAge: 24 * 60 * 60 * 1000,
    secure: true,
    httpOnly: true,
    sameSite: "none",
}));
app.use(express_1.default.json());
app.use(passport_config_1.default.initialize());
app.use(passport_config_1.default.session());
app.use((0, cookie_parser_1.default)());
const allowedOrigins = [
    "http://localhost:3000",
    "https://flavourfleet.vercel.app",
];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
}));
app.use("/api/auth", AuthRoutes_1.default);
app.use("/api/user", UserRoutes_1.userRouter);
app.use("/api/restaurant", restroRoutes_1.default);
app.use("/api/admin", AdminRoutes_1.AdminRouter);
app.use("/api/search", SearchRoutes_1.default);
app.use("/api/cart", CartRoutes_1.CartRouter);
app.use("/api/order", orderRoutes_1.OrderRouter);
app.use("/api/payment", PaymentRoutes_1.PaymentRouter);
app.use("/api/coupons", CouponRoutes_1.CouponRouter);
app.get("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send({
        success: true,
        message: "test deployment",
    });
}));
app.get("/mapstyle", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send(mapstyle_1.mapstyle);
}));
mongoose_1.default.connect(process.env.DB_URI).then(() => {
    mongoose_1.default.connection.useDb("foodOrdering");
    console.log("connneted");
    app.listen(5000, () => {
        console.log("server started");
    });
});
