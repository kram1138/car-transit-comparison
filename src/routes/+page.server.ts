import type { Actions } from "./$types";
import z from "zod";
import { Client, TravelMode, Status, type DistanceMatrixResponse, type Duration, type Distance } from "@googlemaps/google-maps-services-js";
const client = new Client({});

async function getData(params: {
  apiKey: string;
  time: string;
  locations: string;
}) {
  const time = Date.parse(`${params.time}Z`) / 1000
  const carResponse = await client.distancematrix({
    params: {
      destinations: params.locations.split("\n"),
      origins: params.locations.split("\n"),
      key: params.apiKey,
      departure_time: time
    }
  });
  const transitResponse = await client.distancematrix({
    params: {
      destinations: params.locations.split("\n"),
      origins: params.locations.split("\n"),
      key: params.apiKey,
      mode: TravelMode.transit,
      departure_time: time
    }
  });
  const transitInfo = toInfo(transitResponse)
  const carInfo = toInfo(carResponse);
  const table = {
    headers: ["Origin address", "Destination address", "Distance by car (m)", "Time by car (s)", "Distance by bus (m)", "Time by bus (s)"],
    rows: carInfo.map((car, i) => {
      const transit = transitInfo[i];
      return [car?.o, car?.d, car?.dist.value, car?.time.value, transit?.dist.value, transit?.time.value,]
    }).filter(([origin, dest, _, __, ___, ____]) => origin !== dest)
  }
  const carDistanceTotal = carInfo.reduce((sum, current) => sum + (current?.dist.value ?? 0), 0);
  const transitDistanceTotal = transitInfo.reduce((sum, current) => sum + (current?.dist.value ?? 0), 0);
  const carTimeTotal = carInfo.reduce((sum, current) => sum + (current?.time.value ?? 0), 0);
  const transitTimeTotal = transitInfo.reduce((sum, current) => sum + (current?.time.value ?? 0), 0);
  const ratios = {
    distance: carDistanceTotal / transitDistanceTotal,
    time: carTimeTotal / transitTimeTotal
  }

  return { table, ratios }

  function toInfo(response: DistanceMatrixResponse) {
    return response.data.rows.flatMap((row, originI) =>
      row.elements.map((element, destI) =>
        element.status === Status.OK
          ? {
            o: response.data.origin_addresses[originI],
            d: response.data.destination_addresses[destI],
            time: element.duration,
            dist: element.distance,
          } : undefined
      )
    )
  }
}

export const actions: Actions = {
  default: async ({ request }) => {
    console.log("received")
    const schema = z.object({
      apiKey: z.string().trim().min(1),
      time: z.string().min(1),
      locations: z.string().min(1)
    })
    const formData = Object.fromEntries(await request.formData());
    const parsedData = schema.safeParse(formData);
    if (parsedData.success) {
      const info = await getData(parsedData.data);
      return {
        success: true,
        data: formData,
        ...info
      }
    } else {
      return {
        success: false,
        message: parsedData.error.errors.map(e =>
          `${e.path}: ${e.message}`
        ).join("\n"),
        data: formData
      }
    }
  }
};