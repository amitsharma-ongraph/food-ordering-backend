import axios from "axios";
import { IAddress } from "../../types/Schema/IAddress";

interface IReturns {
  deliveryAmount: number | null;
  deliveryOutlet: IAddress | null;
}
export const getOptimalDelivery = async (
  userAddress: IAddress,
  outlets: IAddress[]
): Promise<IReturns> => {
  const apiKey = process.env.LOCATION_IQ_API_KEY;
  const source = `${userAddress.location.coordinates[0]},${userAddress.location.coordinates[1]}`;
  const destinations = outlets.map(
    (outlet) => `${outlet.location.coordinates[0]},${outlet.location.coordinates[1]}`
  );
  const destinationIndexs = destinations.map((d, i) => i + 1);
  const baseUrl = "https://us1.locationiq.com/v1/matrix/driving/";

  const coordinates = `${source};${destinations.join(";")}`;
  const url = `${baseUrl}${coordinates}?sources=0&destinations=${destinationIndexs.join(
    ";"
  )}&annotations=distance,duration&key=${apiKey}`;
  try {
    const res = await axios.get(url);
    const { data } = res;
    const distances = data.distances[0];

    const minIndex = distances.reduce(
      (minIndex: number, s: number, i: number) => {
        return distances[minIndex] < s ? minIndex : i;
      },
      0
    );
    const minDistance = distances[minIndex];
    const distanceCharge =
      (minDistance * parseFloat(process.env.DELIVERY_CHARGE_PER_100 || "1.2")) /
      100;
    const minCharge = parseFloat(process.env.MIN_DELIVERY_CHARGE || "25");
    const deliveryAmount = parseFloat(
      (distanceCharge > minCharge ? distanceCharge : minCharge).toFixed(2)
    );
    return {
      deliveryAmount,
      deliveryOutlet: outlets[minIndex],
    };
  } catch (error) {
    console.log("error-->", error);
    return {
      deliveryAmount: null,
      deliveryOutlet: null,
    };
  }
};
