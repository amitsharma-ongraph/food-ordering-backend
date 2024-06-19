"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioClient = void 0;
const twilio_1 = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
exports.TwilioClient = new twilio_1.Twilio(accountSid, authToken);
