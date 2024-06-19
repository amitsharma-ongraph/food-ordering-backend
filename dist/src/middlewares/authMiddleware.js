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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isLoggedIn = void 0;
const isLoggedIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("req headers", req.headers.cookie);
        //@ts-ignore
        const isLoggedIn = (req.isAuthenticated() && req.user !== undefined) ? true : false;
        if (isLoggedIn) {
            next();
        }
        else {
            return res.status(200).send({
                success: false,
                message: "not authorized",
            });
        }
    }
    catch (error) {
        return res.status(200).send({
            success: false,
            message: "not authorized",
        });
    }
});
exports.isLoggedIn = isLoggedIn;
const isAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    //@ts-ignore
    if (!((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.passport) === null || _b === void 0 ? void 0 : _b.user)) {
        return res.status(200).send({
            success: false,
            message: "not authorized",
        });
    }
    //@ts-ignore
    const isAdmin = req.session.passport.user === process.env.ADMIN_SECRET;
    if (isAdmin) {
        next();
    }
    else {
        return res.status(200).send({
            success: false,
            message: "not authorized",
        });
    }
});
exports.isAdmin = isAdmin;
