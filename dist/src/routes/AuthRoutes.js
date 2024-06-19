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
const passport_config_1 = __importDefault(require("../passport/passport-config"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const restaurant_1 = __importDefault(require("../models/restaurant"));
const twilio_1 = require("../twilio");
const authRouter = express_1.default.Router();
authRouter.get("/google", passport_config_1.default.authenticate("google", {
    scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/user.phonenumbers.read",
    ],
}));
authRouter.get("/google/callback", passport_config_1.default.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: process.env.CLIENT_URL,
}), (req, res) => {
    res.redirect("/");
});
authRouter.get("/login/failed", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(401).send({
        success: false,
    });
}));
authRouter.get("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.logOut(() => { });
        return res.send({
            success: true,
            message: "logout success",
        });
    }
    catch (error) {
        return res.send({
            success: false,
            message: "logout faild",
        });
    }
}));
authRouter.get("/authenticate", authMiddleware_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send({
        success: true,
        //@ts-ignore
        userId: req.session.passport.user,
    });
}));
authRouter.post("/login", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield passport_config_1.default.authenticate("local", (err, user, info) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res
                .status(500)
                .json({ sucess: false, message: "Internal server error" });
        }
        if (!user) {
            return res.status(200).json({ success: false, message: info.message });
        }
        yield req.login(user, (err) => {
            if (err) {
                return res.status(200).send({
                    success: false,
                    message: "Errror while setting up the user session",
                });
            }
        });
        res.status(200).json({ success: true, message: "Login successful" });
    }))(req, res, next);
}));
authRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = req.body;
        const existingUser = yield user_1.default.findOne({ email });
        if (existingUser) {
            return res.status(200).json({
                success: false,
                message: "User with this email already exists",
            });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new user_1.default({
            name,
            email,
            password: hashedPassword,
            contactNo: null,
        });
        yield newUser.save();
        res
            .status(201)
            .json({ success: true, message: "User registered successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
authRouter.get("/isAdmin", authMiddleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).send({
        success: true,
    });
}));
authRouter.post("/verification/role", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.session.passport.user;
        if (!userId) {
            return res.status(200).send({
                success: false,
            });
        }
        const user = yield user_1.default.findById(userId);
        if (!user) {
            return res.status(200).send({
                success: false,
            });
        }
        const restros = yield restaurant_1.default.find({ ownerId: userId }).populate("ownerId");
        const restro = restros[0];
        if (restro) {
            return res.status(200).send({
                success: true,
                role: "Restaurant",
            });
        }
        const isAdmin = userId === process.env.ADMIN_SECRET;
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
    }
    catch (error) {
        return res.status(200).send({
            success: false,
        });
    }
}));
authRouter.get("/verification/contact", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.session.passport.user;
        const user = yield user_1.default.findById(userId).lean();
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
    }
    catch (error) {
        return res.status(200).send({
            success: false,
        });
    }
}));
authRouter.post("/send-otp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber } = req.body;
    const verifyServiceSid = process.env.TWILIO_SERVICE_SID || "";
    yield twilio_1.TwilioClient.verify.v2
        .services(verifyServiceSid)
        .verifications.create({ to: `+91${phoneNumber}`, channel: "sms" })
        .then((verification) => res.status(200).send({ success: true }))
        .catch((error) => res.status(500).send({ success: false }));
}));
authRouter.post("/verify-otp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.session.passport.user;
    const { phoneNumber, otp } = req.body;
    const verifyServiceSid = process.env.TWILIO_SERVICE_SID || "";
    yield twilio_1.TwilioClient.verify.v2
        .services(verifyServiceSid)
        .verificationChecks.create({ to: `+91${phoneNumber}`, code: otp })
        .then((verification_check) => __awaiter(void 0, void 0, void 0, function* () {
        if (verification_check.status === "approved") {
            try {
                const user = yield user_1.default.findByIdAndUpdate(userId, {
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
            }
            catch (error) {
                console.log("user error->", error);
                return res.status(500);
            }
        }
        else {
            return res.status(200).send({
                success: false,
            });
        }
    }))
        .catch((error) => {
        console.log("opt error ", error);
        return res.status(500).send(`Failed to verify OTP: ${error.message}`);
    });
}));
exports.default = authRouter;
