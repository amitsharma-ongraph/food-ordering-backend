"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["Placed"] = "placed";
    OrderStatus["Accepted"] = "accepted";
    OrderStatus["Preparing"] = "preparing";
    OrderStatus["Ready"] = "ready";
    OrderStatus["Out"] = "out_for_delivery";
    OrderStatus["Delivered"] = "delivered";
    OrderStatus["Rejected"] = "rejected";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
