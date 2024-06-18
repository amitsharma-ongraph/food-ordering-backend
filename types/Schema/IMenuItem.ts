export interface IMenuItem extends Document {
  id: string;
  name: string;
  price: number;
  groupName: string;
  ratings: string;
  totalReview: number;
  imageUrl: string;
  description: string;
  totalOrders: number;
}
