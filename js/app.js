import { fetchWeather, accessAllowed, searchCities } from "./api.js";
import {
  renderWeather,
  showError,
  showLoading,
  showNoResults,
  accessNoAllow,
  renderMainCard,
  renderStatsGrid,
  renderDailyForecast,
  renderHourlySidebar,
  updateUnitsMenu,
  closeSuggestions,
  renderSuggestions,
  showSearchSpinner,
  dailyTempGrid, // this is for i think  for when you click and it show on the today temp
  daySelectOption,
  searchForm,
  toggleBtn,
  searchContainer,
} from "./renderHTML.js";
import { state, changeState } from "./state.js";

const unitBtn = document.querySelector(".units-btn");
const unitMenu = document.querySelector(".units-menu");
const citySearchInput = document.querySelector("#city-search");

function init() {
  requestGeolocation();
  registerEvents();
}

function requestGeolocation() {
  if (!navigator.geolocation) {
    accessNoAllow();
    return;
  }
  showLoading();
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude: lat, longitude: lon } = position.coords;
      changeState({ lat, lon });
      await loadWeatherByCoords(lat, lon);
    },
    (error) => {
      accessNoAllow();
    },
    { timeout: 10000 },
  );
}

async function loadWeatherByCoords(lat, lon) {
  showLoading();
  changeState({ status: "loading", selectDayIndex: 0 });

  try {
    const [weatherData, location] = await Promise.all([
      fetchWeather(lat, lon),
      accessAllowed(lat, lon),
    ]);

    if (state.abort) return;

    changeState({
      weatherData,
      locationCity: location.city,
      locationCountry: location.country,
      status: "loaded",
    });
    renderWeather();
  } catch (err) {
    console.error(err);
    changeState({ status: "error" });
    showError(err);
  }
}

async function loadWeatherByCity(cityResult) {
  changeState({ abort: true });
  const { latitude: lat, longitude: lon, name, country } = cityResult;
  citySearchInput.value = name;
  closeSuggestions();

  showLoading();
  changeState({
    lat,
    lon,
    locationCity: name,
    locationCountry: country ?? "",
    status: "loading",
    selectDayIndex: 0,
  });

  try {
    const weatherData = await fetchWeather(lat, lon);
    changeState({ weatherData, status: "loaded" });
    renderWeather();
  } catch (err) {
    console.error(err);
    changeState({ status: "error" });
    showError(err);
  }
}

let searchBounceTimer = null;

async function handleSearch(query) {
  const q = query.trim();
  if (!q) {
    closeSuggestions();
    return;
  }

  showSearchSpinner();
  changeState({ status: "loading" });
  try {
    const results = await searchCities(q);
    if (!results || results.length === 0) {
      closeSuggestions();
      showNoResults();
      return;
    }
    changeState({ status: "loaded" });
    renderSuggestions(results, loadWeatherByCity);
  } catch (err) {
    console.error(err);
    closeSuggestions();
    changeState({ status: "error" });
  }
}

function handleUnitsToggle() {
  const isImperial = !state.isImperial;
  changeState({ isImperial });
  updateUnitsMenu(isImperial);

  if (state.status === "loaded") {
    renderMainCard();
    renderStatsGrid();
    renderDailyForecast();
    renderHourlySidebar();
  }
}

function handleDaySelect(index) {
  changeState({ selectDayIndex: index });

  if (state.status === "loaded") {
    renderMainCard();
    renderStatsGrid();
    renderHourlySidebar();
    highlightSelectedDay(index);
  }
}

function highlightSelectedDay(index) {
  dailyTempGrid.querySelectorAll(".forecast").forEach((item) => {
    item.classList.toggle(
      "selected",
      parseInt(item.dataset.selectIndex) === index,
    );
  });
}

function registerEvents() {
  unitBtn.addEventListener("click", () => {
    unitMenu.classList.toggle("show");
    unitBtn.setAttribute("aria-expanded", unitMenu.classList.contains("show"));
  });

  document.addEventListener("click", (e) => {
    if (!unitBtn.contains(e.target) && !unitMenu.contains(e.target)) {
      unitMenu.classList.remove("show");
      unitBtn.setAttribute("aria-expanded", "false");
    }
  });

  toggleBtn.addEventListener("click", () => {
    handleUnitsToggle();
  });

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = citySearchInput.value.trim();
    if (!q) {
      closeSuggestions();
      return;
    }
    clearTimeout(searchBounceTimer);
    handleSearch(q);
  });

  citySearchInput.addEventListener("input", () => {
    clearTimeout(searchBounceTimer);
    const q = citySearchInput.value.trim();
    if (!q) {
      closeSuggestions();
      return;
    }

    searchBounceTimer = setTimeout(() => {
      handleSearch(q);
    }, 400);
  });

  document.addEventListener("click", (e) => {
    if (!searchContainer.contains(e.target)) {
      closeSuggestions();
    }
  });

  citySearchInput.addEventListener("keydown", (e) => {
    const dropdown = document.querySelector(".search-suggestions");
    if (!dropdown) return;
    const items = dropdown.querySelectorAll(".suggestion-item");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[0].focus();
    }

    if (e.key === "Escape") {
      closeSuggestions();
      citySearchInput.blur();
    }
  });

  daySelectOption.addEventListener("change", (e) => {
    handleDaySelect(parseInt(e.target.value));
  });

  dailyTempGrid.addEventListener("click", (e) => {
    const forcast = e.target.closest(".forecast");
    if (!forcast) return;
    handleDaySelect(parseInt(forcast.dataset.selectIndex));
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest(".retry-btn")) {
      const el = document.querySelector("#special-state");
      if (el) el.style.display = "none";
      if (state.lat && state.lon) {
        changeState({ abort: false });
        loadWeatherByCoords(state.lat, state.lon);
      } else {
        requestGeolocation();
      }
    }
  });
}

init();
