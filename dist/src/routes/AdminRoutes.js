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
exports.AdminRouter = void 0;
const express_1 = __importDefault(require("express"));
const restaurant_1 = __importDefault(require("../models/restaurant"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
exports.AdminRouter = express_1.default.Router();
exports.AdminRouter.get("/restaurants", authMiddleware_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restroList = yield restaurant_1.default.find().populate("ownerId");
        if (restroList) {
            return res.status(200).send({
                success: true,
                restroList: restroList,
            });
        }
        return res.status(200).send({
            success: false,
            message: "Error while fetching restaurant applications",
        });
    }
    catch (error) {
        return res.status(200).send({
            success: false,
        });
    }
}));
exports.AdminRouter.post("/restaurant/accept", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedRestro = yield restaurant_1.default.findByIdAndUpdate(req.body.restroId, { status: "Approved" });
        if (updatedRestro) {
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
exports.AdminRouter.post("/restaurant/reject", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedRestro = yield restaurant_1.default.findByIdAndUpdate(req.body.restroId, { status: "Rejected" });
        if (updatedRestro) {
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
