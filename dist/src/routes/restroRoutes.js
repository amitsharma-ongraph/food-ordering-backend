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
const restroRouter = express_1.default.Router();
restroRouter.get("/available", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.session.passport.user;
        const restros = yield restaurant_1.default.find({ ownerId: userId }).populate("ownerId");
        const restro = restros[0];
        if (restro) {
            return res.status(200).send({
                success: true,
                restaurant: restro,
            });
        }
        return res.status(200).send({
            success: false,
        });
    }
    catch (error) {
        return res.status(500);
    }
}));
restroRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, addressLine, city, country, zipCode, logoUrl, ownerId, longitude, latitude, } = req.body;
        const restro = new restaurant_1.default({
            name,
            logoUrl,
            outlets: [
                {
                    addressLine,
                    city,
                    country,
                    zipCode,
                    location: {
                        coordinates: [longitude, latitude]
                    }
                },
            ],
            cuisins: [],
            menuItems: [],
            status: "Pending",
            ownerId,
            menuGroups: [],
        });
        yield restro.save();
        return res.status(200).send({
            success: true,
        });
    }
    catch (error) {
        console.log("error-->", error);
        res.status(500);
    }
}));
restroRouter.post("/add-menu-group", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupName, restroId } = req.body;
        const updatedRestro = yield restaurant_1.default.findByIdAndUpdate(restroId, {
            $push: {
                menuGroups: groupName,
            },
        });
        if (updatedRestro) {
            return res.status(200).send({
                success: true,
                groupName,
            });
        }
        return res.status(200).send({
            success: false,
        });
    }
    catch (error) {
        return res.status(500).send({});
    }
}));
restroRouter.post("/add-cuisine", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cuisineName, restroId } = req.body;
        const updatedRestro = yield restaurant_1.default.findByIdAndUpdate(restroId, {
            $push: {
                cuisins: cuisineName,
            },
        });
        if (updatedRestro) {
            return res.status(200).send({
                success: true,
                cuisineName,
            });
        }
        return res.status(200).send({
            success: false,
        });
    }
    catch (error) {
        return res.status(500).send({});
    }
}));
restroRouter.post("/add-menuitem", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, price, imageUrl, restroId, groupName } = req.body;
    const updatedRestro = yield restaurant_1.default.findByIdAndUpdate(restroId, {
        $push: {
            menuItems: {
                name,
                price,
                groupName,
                ratings: "4.0",
                totalReview: 0,
                imageUrl,
                description,
                totalOrders: 0,
            },
        },
    }, { new: true });
    if (updatedRestro) {
        //@ts-ignore
        const menuItemId = updatedRestro.menuItems[updatedRestro.menuItems.length - 1]._id;
        return res.status(200).send({
            success: true,
            menuItemId,
        });
    }
    return res.status(200).send({
        success: false,
    });
}));
restroRouter.delete("/delete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.session.passport.user;
        const restros = yield restaurant_1.default.find({ ownerId: userId }).populate("ownerId");
        const restro = restros[0];
        if (restro) {
            yield restaurant_1.default.findByIdAndDelete(restro.id);
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
restroRouter.get("/clone", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sourceRestaurant = yield restaurant_1.default.findById("66436784f4636d4d8292dfce");
        const { menuGroups, menuItems } = sourceRestaurant;
        yield restaurant_1.default.updateMany({ _id: { $ne: "66436784f4636d4d8292dfce" } }, {
            $addToSet: {
                menuGroups: { $each: menuGroups },
                menuItems: { $each: menuItems },
            },
        });
        console.log("Menu groups and menu items updated successfully for other restaurants.");
    }
    catch (error) {
        console.error("Error updating restaurants:", error);
    }
}));
restroRouter.post("/add-outlet", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, address: { city, country, zipCode, addressLine, isPrimary, location }, } = req.body;
    try {
        const updatedRestro = yield restaurant_1.default.findByIdAndUpdate(id, {
            $push: {
                outlets: {
                    city,
                    country,
                    zipCode,
                    addressLine,
                    isPrimary,
                    location
                },
            },
        }, { new: true });
        if (!updatedRestro) {
            return res
                .status(404)
                .json({ success: false, message: "Restaurant not found" });
        }
        const { _id: addressId } = updatedRestro.outlets[updatedRestro.outlets.length - 1];
        return res.status(201).send({
            success: true,
            message: "Outlet Added Succesfully",
            addressId,
        });
    }
    catch (error) {
        return res.status(500);
    }
}));
restroRouter.get("/get-all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rating, veg, longitude: lon, latitude: lat, nearest } = req.query;
        const longitude = lon === null || lon === void 0 ? void 0 : lon.toString();
        const latitude = lat === null || lat === void 0 ? void 0 : lat.toString();
        let filter = [{ status: "Approved" }];
        if (rating) {
            filter.push({ ratings: { "$gte": "4" } });
        }
        if (veg) {
            filter.push({ isVeg: true });
        }
        if (nearest) {
            filter.push({ "outlets.distance": { "$lte": 3000 } });
        }
        if (!longitude || !latitude) {
            return res.status(200).send({
                success: true,
                allRestaurants: []
            });
        }
        const restaurants = yield restaurant_1.default.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [Number(longitude), Number(latitude)]
                    },
                    distanceField: "outlets.distance",
                    spherical: true,
                    key: "outlets.location"
                }
            },
            {
                $match: {
                    $and: filter
                }
            }
        ]);
        const allRestaurants = restaurants.map((restro) => ({
            id: restro._id,
            name: restro.name,
            ratings: restro.ratings,
            logoUrl: restro.logoUrl,
            tags: restro.cuisins.splice(0, 2),
            distance: restro.outlets.distance
        }));
        res.status(200).send({
            success: true,
            allRestaurants,
        });
    }
    catch (error) {
        console.log(error);
        res.status(200).send({
            success: false,
        });
    }
}));
exports.default = restroRouter;
