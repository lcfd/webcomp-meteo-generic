import { BASE_PATH, BASE_PATH_MOBILITY, BASE_PATH_TOURISM } from "./config";

export const requestTourismMeasuringpoint = async () => {
  try {
    const request = await fetch(`${BASE_PATH_TOURISM}/Weather/Measuringpoint`);
    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    const response = await request.json();
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const requestMobilityMeteoStationSelectedData = async () => {
  try {
    const request = await fetch(
      `${BASE_PATH_MOBILITY}/flat,node/MeteoStation/*?limit=-1&select=scoordinate,scode,sname,stype`
    );
    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    const response = await request.json();
    return response;
  } catch (error) {
    console.log(error);
  }
};
