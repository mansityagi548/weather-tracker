//  apis we need
export const apis = {
  GEOCODING: "https://geocoding-api.open-meteo.com/v1/search",
  WEATHERAPI: "https://api.open-meteo.com/v1/forecast",
  ACCESSALLOWED: "https://nominatim.openstreetmap.org/reverse",
};



// for weather emoji
const weatherEmoji = {
  0: { emoji: "☀️", label: "Clear Sky" },
  1: { emoji: "🌤️", label: "Mainly Clear" },
  2: { emoji: "⛅", label: "Partly Cloudy" },
  3: { emoji: "☁️", label: "Overcast" },
  45: { emoji: "🌫️", label: "Foggy" },
  48: { emoji: "🌫️", label: "Icy Fog" },
  51: { emoji: "🌦️", label: "Light Drizzle" },
  53: { emoji: "🌦️", label: "Drizzle" },
  55: { emoji: "🌧️", label: "Heavy Drizzle" },
  56: { emoji: "🌨️", label: "Freezing Drizzle" },
  57: { emoji: "🌨️", label: "Heavy Freezing Drizzle" },
  61: { emoji: "🌧️", label: "Slight Rain" },
  63: { emoji: "🌧️", label: "Rain" },
  65: { emoji: "🌧️", label: "Heavy Rain" },
  66: { emoji: "🌨️", label: "Freezing Rain" },
  67: { emoji: "🌨️", label: "Heavy Freezing Rain" },
  71: { emoji: "❄️", label: "Slight Snow" },
  73: { emoji: "❄️", label: "Snow" },
  75: { emoji: "❄️", label: "Heavy Snow" },
  77: { emoji: "🌨️", label: "Snow Grains" },
  80: { emoji: "🌦️", label: "Slight Showers" },
  81: { emoji: "🌧️", label: "Showers" },
  82: { emoji: "🌧️", label: "Heavy Showers" },
  85: { emoji: "🌨️", label: "Snow Showers" },
  86: { emoji: "🌨️", label: "Heavy Snow Showers" },
  95: { emoji: "⛈️", label: "Thunderstorm" },
  96: { emoji: "⛈️", label: "Thunderstorm w/ Hail" },
  99: { emoji: "⛈️", label: "Heavy Thunderstorm w/ Hail" },
};

// for getting that emoji
export function getWeatherEmoji(code) {
  return weatherEmoji[code] ?? { emoji: "🌡️", label: "unkown" };
}

// c -> f .. why for f and not for c by default api send weather in celcius
function toFahrenheit(val) {
  return Math.round((val * 9) / 5 + 32);
}

// kmh -> mph
function toMph(kmh) {
  return Math.round(kmh * 0.621371);
}

// mm -> in;
function toInches(mm) {
  return (mm * 0.0393701).toFixed(2);
}

export function formatTemp(temp, isImperial) {
  return isImperial ? `${toFahrenheit(temp)}°` : `${Math.round(temp)}°`;
}

export function formatWind(wind, isImperial) {
  return isImperial ? `${toMph(wind)} mph ` : `${Math.round(wind)} km/h`;
}

export function formatPrecip(precip, isImperial) {
  return isImperial ? `${toInches(precip)} in ` : `${Math.round(precip)} mm`;
}

export const DAYS = ["Sunday" , "Monday" , "Tuesday" , "Wednesday" , "Thursday" , "Friday" , "Saturday"];

export const days_short = ["Sun" , "Mon" , "Tue" , "Wed" , "Thu" , "Fri" , "Sat"];


// this for main card day and month showing
export function daysFormat(dateStr){
   const d = new Date(dateStr + "T00:00:00");
   const day = DAYS[d.getDay()];
   const monthShort = d.toLocaleString("en-us" , {month : "short"});
   const date  = d.getDate();
   const year = d.getFullYear();
  return {day , monthShort , date , year};
}


