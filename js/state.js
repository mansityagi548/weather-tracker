
export const state = {
  weatherData: null,
  lat: null,
  lon: null,
  locationCountry: "",
  locationCity: "",
  status: "idle",
  selectDayIndex: 0,
  isImperial: false,
  abort : false,
};


export function changeState(value){
    Object.assign(state , value);
}
