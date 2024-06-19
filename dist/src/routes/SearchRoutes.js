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
const restaurant_1 = __importDefault(require("../models/restaurant"));
const coupon_1 = __importDefault(require("../models/coupon"));
const SearchRouter = express_1.default.Router();
SearchRouter.get("/group-suggestion", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurants = yield restaurant_1.default.find({}, { menuItems: 1 }).limit(16);
        const allMenuItems = restaurants.flatMap((restaurant) => restaurant.menuItems);
        const map = new Map();
        allMenuItems.forEach((item) => {
            const groupName = item.groupName.toLowerCase();
            if (!map.has(groupName)) {
                map.set(groupName, item.imageUrl);
            }
        });
        let allGroups = [];
        map.forEach((value, key) => {
            allGroups.push({
                groupName: key,
                imageUrl: value,
            });
        });
        return res.status(200).send({
            success: true,
            groups: allGroups,
        });
    }
    catch (error) {
        console.error("Error fetching distinct pairs:", error);
        throw error;
    }
}));
SearchRouter.get("/:keyword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { keyword } = req.params;
        const { rating, veg, longitude: lon, latitude: lat, nearest } = req.query;
        const longitude = lon === null || lon === void 0 ? void 0 : lon.toString();
        const latitude = lat === null || lat === void 0 ? void 0 : lat.toString();
        let filter = [{ status: "Approved" }];
        if (rating) {
            filter.push({ ratings: { $gte: "4" } });
        }
        if (veg) {
            filter.push({ isVeg: true });
        }
        if (nearest) {
            filter.push({ "outlets.distance": { $lte: 3000 } });
        }
        if (!longitude || !latitude) {
            return res.status(200).send({
                success: true,
                allRestaurants: [],
            });
        }
        const restaurants = yield restaurant_1.default.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [Number(longitude), Number(latitude)],
                    },
                    distanceField: "outlets.distance",
                    spherical: true,
                    key: "outlets.location",
                },
            },
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                { name: { $regex: keyword, $options: "i" } },
                                { cuisins: { $regex: keyword, $options: "i" } },
                                { menuGroups: { $regex: keyword, $options: "i" } },
                                { "menuItems.name": { $regex: keyword, $options: "i" } },
                            ],
                        },
                        ...filter,
                    ],
                },
            },
        ]);
        const allRestaurants = restaurants.map((restro) => ({
            id: restro._id,
            name: restro.name,
            ratings: restro.ratings,
            logoUrl: restro.logoUrl,
            tags: restro.cuisins.splice(0, 2),
            distance: restro.outlets.distance,
        }));
        return res.status(200).send({
            success: true,
            allRestaurants,
        });
    }
    catch (error) {
        return res.status(200).send({
            success: false,
            message: "unexpected error occured",
        });
    }
}));
SearchRouter.get("/search-options/:keyword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { keyword } = req.params;
        const restaurants = yield restaurant_1.default.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                {
                    cuisins: { $regex: keyword, $options: "i" },
                },
                {
                    menuGroups: { $regex: keyword, $options: "i" },
                },
                {
                    "menuItems.name": { $regex: keyword, $options: "i" },
                },
            ],
        }, "name logoUrl cuisins menuGroups menuItems").limit(10);
        const keywords = restaurants.flatMap((restaurant) => {
            const keywordObjects = [];
            if (restaurant.name.toLowerCase().includes(keyword.toLowerCase())) {
                keywordObjects.push({
                    value: restaurant.name,
                    matchField: "Restaurants",
                    logoUrl: restaurant.logoUrl,
                });
            }
            restaurant.menuGroups.forEach((group) => {
                if (group.toLowerCase().includes(keyword.toLowerCase())) {
                    keywordObjects.push({
                        value: group,
                        matchField: "Dishes",
                        logoUrl: null,
                    });
                }
            });
            restaurant.menuItems.forEach((item) => {
                if (item.name.toLowerCase().includes(keyword.toLowerCase())) {
                    keywordObjects.push({
                        value: item.name,
                        matchField: "Dishes",
                        logoUrl: item.imageUrl,
                    });
                }
            });
            restaurant.cuisins.forEach((cuisine) => {
                if (cuisine.toLowerCase().includes(keyword.toLowerCase())) {
                    keywordObjects.push({
                        value: cuisine,
                        matchField: "Cuisines",
                        logoUrl: null,
                    });
                }
            });
            return keywordObjects;
        });
        const filteredKeywords = Object.values(keywords.reduce((acc, obj) => {
            acc[obj.value.toLowerCase()] = acc[obj.value.toLowerCase()] || obj;
            return acc;
        }, {}));
        return res.status(200).send({
            success: true,
            searchOptions: filteredKeywords,
        });
    }
    catch (error) {
        console.log("errrror---.", error);
        return res.status(200).send({
            success: false,
            message: "unexpected error occured",
        });
    }
}));
SearchRouter.get("/restro-menu/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const restaurant = yield restaurant_1.default.findById(id);
        const menuList = restaurant === null || restaurant === void 0 ? void 0 : restaurant.menuItems.map((menuItem) => ({
            //@ts-ignore
            id: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            ratings: menuItem.ratings,
            imageUrl: menuItem.imageUrl,
            totalReview: menuItem.totalReview,
            description: menuItem.description,
            groupName: menuItem.groupName,
        }));
        const coupons = yield coupon_1.default.find({
            restroId: id,
            isPublic: true,
            activated: true,
        });
        if (restaurant) {
            return res.status(200).send({
                success: true,
                restaurant: {
                    id: restaurant.id,
                    name: restaurant.name,
                    outlets: restaurant.outlets,
                    cuisins: restaurant.cuisins,
                    menuItems: menuList,
                    logoUrl: restaurant.logoUrl,
                    ratings: restaurant.ratings,
                    menuGroups: restaurant.menuGroups,
                    coupons,
                },
            });
        }
    }
    catch (error) {
        return res.status(200).send({
            success: false,
        });
    }
}));
exports.default = SearchRouter;
