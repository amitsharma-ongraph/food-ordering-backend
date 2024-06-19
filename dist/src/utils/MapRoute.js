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
exports.getRoute = void 0;
const axios_1 = __importDefault(require("axios"));
const polyline_1 = __importDefault(require("@mapbox/polyline"));
const getRoute = (sourceAddress, destinationAddress) => __awaiter(void 0, void 0, void 0, function* () {
    const apiKey = process.env.LOCATION_IQ_API_KEY;
    const source = `${sourceAddress.location.coordinates[0]},${sourceAddress.location.coordinates[1]}`;
    const destination = `${destinationAddress.location.coordinates[0]},${destinationAddress.location.coordinates[1]}`;
    const coordinates = [source, destination].join(";");
    const baseUrl = "https://us1.locationiq.com/v1/directions/driving/";
    const url = `${baseUrl}${coordinates}/${coordinates}?key=${apiKey}`;
    try {
        const res = yield axios_1.default.get(url);
        const { data } = res;
        const { geometry } = data.routes[0];
        const decodedCoord = polyline_1.default.decode(geometry);
        const coords = decodedCoord.map((coords) => [coords[1], coords[0]]);
        return coords;
    }
    catch (error) { }
});
exports.getRoute = getRoute;
