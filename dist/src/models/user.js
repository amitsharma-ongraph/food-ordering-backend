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
exports.userSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const addressSchema_1 = __importDefault(require("../schema/addressSchema"));
const cartSchema_1 = require("../schema/cartSchema");
exports.userSchema = new mongoose_1.default.Schema({
    googleId: {
        type: String,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    addressList: [addressSchema_1.default],
    contactNo: {
        type: String,
    },
    carts: [cartSchema_1.cartSchema],
    verified: { type: Boolean, default: false }
});
exports.userSchema.method("isValidPassword", function isValidPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const userPassword = this.password;
        const isValidPassword = yield bcrypt_1.default.compare(password, userPassword);
        return isValidPassword;
    });
});
exports.userSchema.method("isGoogleId", function isGoogleId() {
    return this.googleId ? true : false;
});
const User = mongoose_1.default.model("User", exports.userSchema);
exports.default = User;
