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
exports.googleStrategy = void 0;
const passport_google_oauth20_1 = require("passport-google-oauth20");
require("dotenv/config");
const user_1 = __importDefault(require("../../models/user"));
const config = {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
};
const verifyCallback = (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let existingUser = yield user_1.default.findOne({
            googleId: profile.id,
        });
        if (existingUser) {
            return done(null, existingUser);
        }
        else {
            const newUser = new user_1.default({
                googleId: profile.id,
                name: profile.displayName,
                email: profile._json.email,
                contactNo: "",
                addressList: [],
            });
            const savedUser = yield newUser.save();
            return done(null, savedUser);
        }
    }
    catch (error) {
        return done(error);
    }
});
exports.googleStrategy = new passport_google_oauth20_1.Strategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, verifyCallback);
