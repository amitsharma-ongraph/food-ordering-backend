import { ObjectId } from "mongoose";
import { DiscountType } from "../../enums/DiscountType";
import { DiscountCondition } from "../../enums/DiscountCondition";

export interface ICoupon {
  restroId: ObjectId;
  code: string;
  redemptions?: number;
  availed: number;
  type: DiscountType;
  discount?: number;
  giftItemId?: string;
  condition: DiscountCondition;
  billAmount?: number;
  combination?: ObjectId[];
  activated: boolean;
  isPublic: boolean;
  upto: number;
  limited: Boolean;
}
