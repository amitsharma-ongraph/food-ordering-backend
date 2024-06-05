export interface IAddress extends Document {
  addressLine: string;
  city: string;
  country: string;
  zipCode: string;
  isPrimary: boolean;
  location:any
}
