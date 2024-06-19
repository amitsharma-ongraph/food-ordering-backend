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
exports.getOptimalDelivery = void 0;
const axios_1 = __importDefault(require("axios"));
const getOptimalDelivery = (userAddress, outlets) => __awaiter(void 0, void 0, void 0, function* () {
    const apiKey = process.env.LOCATION_IQ_API_KEY;
    const source = `${userAddress.location.coordinates[0]},${userAddress.location.coordinates[1]}`;
    const destinations = outlets.map((outlet) => `${outlet.location.coordinates[0]},${outlet.location.coordinates[1]}`);
    const destinationIndexs = destinations.map((d, i) => i + 1);
    const baseUrl = "https://us1.locationiq.com/v1/matrix/driving/";
    const coordinates = `${source};${destinations.join(";")}`;
    const url = `${baseUrl}${coordinates}?sources=0&destinations=${destinationIndexs.join(";")}&annotations=distance,duration&key=${apiKey}`;
    try {
        const res = yield axios_1.default.get(url);
        const { data } = res;
        const distances = data.distances[0];
        const minIndex = distances.reduce((minIndex, s, i) => {
            return distances[minIndex] < s ? minIndex : i;
        }, 0);
        const minDistance = distances[minIndex];
        const distanceCharge = (minDistance * parseFloat(process.env.DELIVERY_CHARGE_PER_100 || "1.2")) /
            100;
        const minCharge = parseFloat(process.env.MIN_DELIVERY_CHARGE || "25");
        const deliveryAmount = parseFloat((distanceCharge > minCharge ? distanceCharge : minCharge).toFixed(2));
        return {
            deliveryAmount,
            deliveryOutlet: outlets[minIndex],
        };
    }
    catch (error) {
        console.log("error-->", error);
        return {
            deliveryAmount: null,
            deliveryOutlet: null,
        };
    }
});
exports.getOptimalDelivery = getOptimalDelivery;
