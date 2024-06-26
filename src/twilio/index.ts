import { Twilio } from "twilio";



const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


export const TwilioClient = new Twilio(accountSid, authToken);