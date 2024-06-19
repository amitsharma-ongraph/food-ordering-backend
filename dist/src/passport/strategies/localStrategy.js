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
exports.localStrategy = void 0;
const passport_local_1 = require("passport-local");
const user_1 = __importDefault(require("../../models/user"));
exports.localStrategy = new passport_local_1.Strategy((username, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findOne({ email: username });
        if (!user) {
            return done(null, false, { message: "Incorrect email." });
        }
        if (user.isGoogleId()) {
            return done(null, false, {
                message: "Please try signing in using your google Id",
            });
        }
        const isValidPassword = yield user.isValidPassword(password);
        if (!isValidPassword) {
            return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
}));
