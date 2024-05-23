import { ObjectId } from "mongoose";
import { OrderStatus } from "../../enums/OrderStatus";
import { IBill } from "./IBill";
import { IAddress } from "./IAddress";
import { IUserPMenuItem } from "./IUserPMenuItem";

export interface IOrder {
  restroAddress: IAddress;
  userAddress: IAddress;
  userId: ObjectId;
  restroId: ObjectId;
  bill: IBill;
  items: IUserPMenuItem;
  status: OrderStatus;
  note: string;
  timeline: {
    placed?: string;
    accepted?: string;
    preparing?: string;
    ready?: string;
    out_for_delivery?: string;
    delivered?: string;
    rejected?: string;
  };
}
