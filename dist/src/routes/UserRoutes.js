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
exports.userRouter = void 0;
const express_1 = require("express");
const user_1 = __importDefault(require("../models/user"));
exports.userRouter = (0, express_1.Router)();
exports.userRouter.post("/details", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        //@ts-ignore
        if (id !== req.session.passport.user) {
            return res.status(200).send({
                success: false,
                message: "Invalid user",
            });
        }
        const user = yield user_1.default.findById(id);
        if (!user) {
            return res.status(200).send({
                success: false,
                message: "user not found",
            });
        }
        if (user) {
            const { _id, name, email, contactNo, addressList } = user;
            return res.status(200).send({
                success: true,
                message: "user details fetched successfully",
                user: {
                    id: _id,
                    name,
                    email,
                    contactNo,
                    addressList,
                },
            });
        }
    }
    catch (error) {
        return res.status(200).send({
            success: false,
            message: "user not found",
        });
    }
}));
exports.userRouter.post("/add-address", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, address: { city, country, zipCode, addressLine, isPrimary, location }, } = req.body;
    try {
        const updatedUser = yield user_1.default.findByIdAndUpdate(id, {
            $push: {
                addressList: {
                    city,
                    country,
                    zipCode,
                    addressLine,
                    isPrimary,
                    location
                },
            },
        }, { new: true });
        if (!updatedUser) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        const { _id: addressId } = updatedUser.addressList[updatedUser.addressList.length - 1];
        return res.status(201).send({
            success: true,
            message: "Address Added Succesfully",
            addressId,
        });
    }
    catch (error) {
        return res.status(500);
    }
}));
exports.userRouter.post("/address/mark-primary", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { addressId, userId } = req.body;
    try {
        const { addressList } = yield user_1.default.findById(userId).select("addressList");
        if (!addressList) {
            return res.status(200).send({
                success: false,
            });
        }
        const updatedAddressList = addressList.map((address) => (Object.assign(Object.assign({}, address._doc), { isPrimary: address._id.toString() === addressId })));
        const updatedUser = yield user_1.default.findByIdAndUpdate(userId, {
            $set: { addressList: updatedAddressList },
        });
        if (!updatedUser) {
            return res.status(200).send({
                success: "false",
            });
        }
        return res.status(200).send({
            success: true,
        });
    }
    catch (error) {
        return res.status(500);
    }
}));
