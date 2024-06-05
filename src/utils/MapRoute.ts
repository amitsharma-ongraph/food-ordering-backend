import axios from "axios";
import { IAddress } from "../../types/Schema/IAddress";
import polyline from "@mapbox/polyline";

export const getRoute = async (
  sourceAddress: IAddress,
  destinationAddress: IAddress
) => {
  const apiKey = process.env.LOCATION_IQ_API_KEY;
  const source = `${sourceAddress.location.coordinates[0]},${sourceAddress.location.coordinates[1]}`;
  const destination = `${destinationAddress.location.coordinates[0]},${destinationAddress.location.coordinates[1]}`;
  const coordinates = [source, destination].join(";");
  const baseUrl = "https://us1.locationiq.com/v1/directions/driving/";

  const url = `${baseUrl}${coordinates}/${coordinates}?key=${apiKey}`;

  try {
    const res = await axios.get(url);
    const { data } = res;
    const { geometry } = data.routes[0];
    const decodedCoord = polyline.decode(geometry);
    const coords = decodedCoord.map((coords) => [coords[1], coords[0]]);
    return coords;
  } catch (error) {}
};
