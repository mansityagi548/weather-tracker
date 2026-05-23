import { apis } from "./logic.js";

export async function searchCities(city) {
  const cityWeather = await fetch(
    `${apis.GEOCODING}?name=${encodeURIComponent(city)}&count=6&language=en&format=json`,
  );
  if (!cityWeather.ok) throw new Error("Geocoding request failed");
  const jsonFormat = await cityWeather.json();
  return jsonFormat.results ?? [];
}

export async function accessAllowed(lat, lon) {
  const location = await fetch(
    `${apis.ACCESSALLOWED}?lat=${lat}&lon=${lon}&format=json`,
    {
      headers: { "Accept-Language": "en" },
    },
  );
  if (!location.ok) throw new Error("Reverse geocoding failed");
  const jsonFormat = await location.json();
  const data = jsonFormat.address ?? {};
  const city =
    data.city ||
    data.state ||
    data.village ||
    data.town ||
    data.municipality ||
    data.county ||
    "Unknown";
  const country = data.country ?? "";
  return { city, country };
}


export async function fetchWeather(lat , lon){
    const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      "temperature_2m", // current temperature
      "apparent_temperature", // the feels like temp
      "relative_humidity_2m", // the humidity
      "wind_speed_10m", // for wind
      "precipitation", // How much rain/snow has fallen in the current hour, in millimetres
      "weather_code", // this is WMO sort of for emojis and label
    ].join(","),
    hourly: [
      "temperature_2m",
      "weather_code",
      "precipitation",
      "apparent_temperature",
      "wind_speed_10m",
      "relative_humidity_2m",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
    ].join(","),
    timezone: "auto", // this is sort of telling that figure the time on our own
    forecast_days: 7, // this is  for daily forecast 7 days
  });

  const url = await fetch(`${apis.WEATHERAPI}?${params}`);
   if(!url.ok) throw new Error("Weather API request failed");
   const jsonFormat = await url.json();
   return jsonFormat;
}
