import { state } from "./state.js";
import {
  formatTemp,
  formatWind,
  formatPrecip,
  DAYS,
  days_short,
  daysFormat,
  getWeatherEmoji,
} from "./logic.js";

const mainCard = document.querySelector(".weather-container");
const question = document.querySelector("#question");
const todayTemp = document.querySelector(".today-temp");
const statsGrid = document.querySelector(".stats-grid");
export const dailyTempGrid = document.querySelector(".daily-temp");
export const daySelectOption = document.querySelector(".day-select");
const hourlyTempGrid = document.querySelector(".hourly-list");
export const searchForm = document.querySelector(".search-form");
export const toggleBtn = document.querySelector("#toggle-units");
export const searchContainer = document.querySelector(".search-container");

export function showLoading() {
  question.style.display = "none";
  mainCard.style.display = "flex";

  todayTemp.innerHTML = `<div class="loading-dots" aria-label="Loading">
      <span></span><span></span><span></span>
    </div>
    <p class="loading-text">Loading...</p>`;

  todayTemp.classList.add("loading");

  statsGrid.querySelectorAll(".stat-value").forEach((card) => {
    card.textContent = "-";
  });

  dailyTempGrid.innerHTML = Array(7)
    .fill("")
    .map(() => {
      return `<div class="forecast skeleton"></div>`;
    })
    .join("");

  hourlyTempGrid.innerHTML = Array(8)
    .fill("")
    .map(() => {
      return `<div class="hourly-item skeleton"></div>`;
    })
    .join("");

  daySelectOption.innerHTML = `<option>–</option>`;
}

function renderSpecialState(errrorType, msg) {
  removeSpecialState();
  const el = document.createElement("div");
  el.id = "special-state";
  el.className = `special-state special-state--${errrorType}`;

  if (errrorType === "error") {
    el.innerHTML = `<span class="special-icon">🚫</span>
      <h2>Something went wrong</h2>
      <p>${msg ?? "We couldn't connect to the server (API error). Please try again in a few moments."}</p>
      <button id="retry-btn" class="retry-btn">↺ Retry</button>`;
  } else {
    el.innerHTML = `<p class="no-results-text">${msg}</p>`;
  }

  searchForm.insertAdjacentElement("afterend", el);
}

function removeSpecialState() {
  const el = document.querySelector("#special-state");
  if (el) el.remove();
}

// this error one is for api
export function showError(msg) {
  question.style.display = "none";
  mainCard.style.display = "none";
  renderSpecialState("error", msg);
}

// this one is for when no city is found
export function showNoResults() {
  question.style.display = "none";
  mainCard.style.display = "none";
  renderSpecialState("noSearchResult", "No search result found");
}

// when access not give
export function accessNoAllow() {
  question.style.display = "none";
  mainCard.style.display = "none";

  let el = document.querySelector("#denied-msg");
  if (!el) {
    el = document.createElement("p");
    el.id = "denied-msg";
    el.className = "denied-message";
    question.insertAdjacentElement("afterend", el);
  }
  el.textContent =
    "Location access denied. For weather updates search the city of your choice.";
  el.style.display = "block";
}


export function renderWeather() {
  const { weatherData } = state;

  if (!weatherData) {
    return;
  }

  question.style.display = "none";
  mainCard.classList.add("show");
  todayTemp.classList.remove("loading");
  removeSpecialState();
  const denied = document.querySelector("#denied-msg");
  if (denied) denied.remove();

  renderDailyForecast();
  renderHourlySidebar();
  renderMainCard();
  renderStatsGrid();
}

export function renderMainCard() {
  const {
    weatherData,
    isImperial,
    selectDayIndex,
    locationCountry,
    locationCity,
  } = state;

  if (!weatherData) return;

  const isToday = selectDayIndex === 0;
  let temp, emojiCode, dateStr;

  if (isToday) {
    temp = weatherData.current.temperature_2m;
    emojiCode = weatherData.current.weather_code;
    dateStr = weatherData.daily.time[0];
  } else {
    const dailyData = weatherData.daily;
    const hourlyData = weatherData.hourly;
    const whichDay = dailyData.time[selectDayIndex];
    const index = hourlyData.time.findIndex((data) => {
      return data.startsWith(whichDay) && data.includes("T12");
    });

    temp =
      index >= 0
        ? hourlyData.temperature_2m[index]
        : dailyData.temperature_2m_max[selectDayIndex];

    emojiCode =
      index >= 0
        ? hourlyData.weather_code[index]
        : dailyData.weather_code[selectDayIndex];

    dateStr = whichDay;
  }

  const { emoji, label } = getWeatherEmoji(emojiCode);
  const { day, monthShort, date, year } = daysFormat(dateStr);
  const displayTemp = formatTemp(temp, isImperial);
  const city =
    locationCountry && locationCity
      ? `${locationCity} , ${locationCountry}`
      : locationCity || locationCountry || "Unknown";

  todayTemp.innerHTML = `<div class="location-info">
          <h2 class="city-name">${city}</h2>
          <p class="date">${day}, ${monthShort} ${date}, ${year}</p>
        </div>
        <div class="temp-display">
          <span class="weather-emoji" title="${label}" aria-label="${label}">${emoji}</span>
          <span class="main-degree" aria-label="${displayTemp} degrees Fahrenheit">${displayTemp}</span>
        </div>`;
}

export function renderStatsGrid() {
  const { weatherData, isImperial, selectDayIndex } = state;

  if (!weatherData) return;
  const dailyData = weatherData.daily;
  const hourlyData = weatherData.hourly;
  const isToday = selectDayIndex === 0;
  let feels, humidity, wind, precip;

  if (isToday) {
    feels = formatTemp(weatherData.current.apparent_temperature, isImperial);
    humidity = `${weatherData.current.relative_humidity_2m}%`;
    wind = formatWind(weatherData.current.wind_speed_10m, isImperial);
    precip = formatPrecip(weatherData.current.precipitation, isImperial);
  } else {
    const dateSelect = dailyData.time[selectDayIndex];
    const index = hourlyData.time.findIndex((data) => {
      return data.startsWith(dateSelect) && data.includes("T12:");
    });

    feels =
      index >= 0
        ? formatTemp(hourlyData.apparent_temperature[index], isImperial)
        : "--";

    humidity = index >= 0 ? `${hourlyData.relative_humidity_2m[index]}%` : "--";
    wind =
      index >= 0
        ? formatWind(hourlyData.wind_speed_10m[index], isImperial)
        : "--";

    precip =
      index >= 0
        ? formatPrecip(hourlyData.precipitation[index], isImperial)
        : "--";
  }

  const cards = statsGrid.querySelectorAll(".card");
  const stats = [feels, humidity, wind, precip];
  cards.forEach((card, i) => {
    const statVal = card.querySelector(".stat-value");
    if (statVal) statVal.textContent = stats[i];
  });
}

export function renderDailyForecast() {
  const { weatherData, isImperial } = state;
  const dailyData = weatherData.daily;

  dailyTempGrid.innerHTML = dailyData.time
    .map((data, i) => {
      const d = new Date(data + "T00:00:00");
      const dateDay = days_short[d.getDay()]; // for getting the day..
      const { emoji, label } = getWeatherEmoji(dailyData.weather_code[i]); // weather code;
      const maxTemp = formatTemp(dailyData.temperature_2m_max[i], isImperial);
      const minTemp = formatTemp(dailyData.temperature_2m_min[i], isImperial);

      return ` <div class="forecast" data-select-index="${i}" role="button" tabindex="0" 
                aria-label = "${dateDay}: ${label} , High ${maxTemp} , Low ${minTemp}">
          <span class="day">${dateDay}</span>
          <span class="weather-day-emoji" title="${label}" aria-hidden="true">${emoji}</span>
          <div class="temp">
            <span class="high-temp">${maxTemp}</span>
            <span class="low-temp">${minTemp}</span>
          </div>
        </div>`;
    })
    .join("");
}

export function renderHourlySidebar() {
  const { weatherData, isImperial, selectDayIndex } = state;
  const dailyData = weatherData.daily;
  const hourlyData = weatherData.hourly;

  // first for the options
  daySelectOption.innerHTML = dailyData.time
    .map((dates, i) => {
      const date = new Date(dates + "T00:00:00");
      const dateDay = DAYS[date.getDay()];

      return `<option  value = "${i}" ${i === selectDayIndex ? "selected" : ""}>${dateDay}</option>`;
    })
    .join("");

  const selectedDay = dailyData.time[selectDayIndex];
  const now = new Date();
  const isToday = selectDayIndex === 0;

  const dateData = hourlyData.time.reduce((acc, timeStr, i) => {
    if (timeStr.startsWith(selectedDay)) {
      acc.push({ timeStr, i });
    }
    return acc;
  }, []);

  let hourToShow = dateData;
  if (isToday) {
    const currentHour = now.getHours();
    const remainingToday = dateData.reduce((acc, item) => {
      const hoursLeft = parseInt(item.timeStr.slice(11, 13));
      if (hoursLeft >= currentHour) {
        acc.push(item);
      }
      return acc;
    }, []);

    if (remainingToday.length < 8 && dailyData.time[1]) {
      const nextDay = dailyData.time[1];
      const needed = 8 - remainingToday.length;
      const nextDayData = hourlyData.time
        .reduce((acc, timeStr, i) => {
          if (timeStr.startsWith(nextDay)) {
            acc.push({ timeStr, i });
          }
          return acc;
        }, [])
        .slice(0, needed);
      hourToShow = [...remainingToday, ...nextDayData];
    } else {
      hourToShow = remainingToday.slice(0, remainingToday.length);
    }
  }

  hourlyTempGrid.innerHTML = hourToShow
    .map(({ timeStr, i }) => {
      const hour = parseInt(timeStr.slice(11, 13));
      const ampm = hour >= 12 ? "PM" : "AM";
      const h = hour % 12 === 0 ? 12 : hour % 12;
      const fullTime = `${h} ${ampm}`;
      const tempHour = `${formatTemp(hourlyData.temperature_2m[i], isImperial)}`;
      const { emoji, label } = getWeatherEmoji(hourlyData.weather_code[i]);

      return `<div class="hourly-item" role="listitem">
      <span class="hourly-emoji" title="${label}" aria-hidden="true">${emoji}</span>
      <span class="hourly-time">${fullTime}</span>
      <span class="hourly-temp">${tempHour}</span>
    </div>`;
    })
    .join("");
}

export function updateUnitsMenu(isImperial) {
  toggleBtn.textContent = isImperial
    ? "Switch to metric"
    : "Switch to imperial";

  document.querySelectorAll("#temp-status .status-item").forEach((item) => {
    const isMetricItem = item.dataset.unit === "metric";
    item.classList.toggle("active", isImperial ? !isMetricItem : isMetricItem);

    const check = item.querySelector(".check");
    if (isImperial ? !isMetricItem : isMetricItem) {
      if (!check) item.innerHTML += ' <span class="check">✓</span>';
    } else {
      if (check) check.remove();
    }
  });

  document.querySelectorAll("#wind-status .status-item").forEach((item) => {
    const isMetricItem = item.dataset.unit === "metric";
    item.classList.toggle("active", isImperial ? !isMetricItem : isMetricItem);

    const check = item.querySelector(".check");
    if (isImperial ? !isMetricItem : isMetricItem) {
      if (!check) item.innerHTML += ' <span class="check">✓</span>';
    } else {
      if (check) check.remove();
    }
  });

  document.querySelectorAll("#precip-status .status-item").forEach((item) => {
    const isMetricItem = item.dataset.unit === "metric";
    item.classList.toggle("active", isImperial ? !isMetricItem : isMetricItem);

    const check = item.querySelector(".check");
    if (isImperial ? !isMetricItem : isMetricItem) {
      if (!check) item.innerHTML += ' <span class="check">✓</span>';
    } else {
      if (check) check.remove();
    }
  });
}

export function closeSuggestions() {
  let dropdown = document.querySelector(".search-suggestions");
  if (dropdown) {
    dropdown.innerHTML = "";
    dropdown.style.display = "none";
  }
}

export function renderSuggestions(results, onselect) {
  let dropdown = document.querySelector(".search-suggestions");
  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.className = "search-suggestions";
    searchContainer.appendChild(dropdown);
  }

  if (!results || results.length === 0) {
    dropdown.innerHTML = "";
    dropdown.style.display = "none";
    return;
  }

  dropdown.style.display = "block";
  dropdown.innerHTML = results
    .map((r, i) => {
      const subtitle = [r.admin1, r.country].filter(Boolean).join(" , ");
      return ` <div class="suggestion-item" data-index="${i}" role="option" tabindex="0"
             aria-label="${r.name}, ${subtitle}">
          <span class="suggestion-name">${r.name}</span>
          ${subtitle ? `<span class="suggestion-sub">${subtitle}</span>` : ""}
        </div>`;
    })
    .join("");

  dropdown.querySelectorAll(".suggestion-item").forEach((item) => {
    item.addEventListener("click", () => {
      const index = parseInt(item.dataset.index);
      onselect(results[index]);
      closeSuggestions();
    });
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
      const index = parseInt(item.dataset.index);
        onselect(results[index]);
        closeSuggestions();
      }
    });
  });
}

export function showSearchSpinner() {
  let dropdown = document.querySelector(".search-suggestions");
  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.className = "search-suggestions";
    document.querySelector(".search-container").appendChild(dropdown);
  }

  dropdown.style.display = "block";
  dropdown.innerHTML = `
    <div class="suggestion-searching">
      <span class="search-spinner"></span>
      Search in progress
    </div>
  `;
}
