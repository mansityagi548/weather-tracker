🌤️ Weather Now :

A clean, responsive weather app built with vanilla JavaScript that gives you real-time weather data for any city in the world — or just your current location.
This is my first big JavaScript project working with multiple APIs together, and honestly it taught me more than I expected.



🔗 **[Live Demo](https://mansityagi548.github.io/weather-tracker/)**

📸 Preview 
![Weather Now App](Weather_api_preview.png)

🚀 Features : 

📍 Auto-detects your location on load using the browser Geolocation API

🔍 Live city search with debounced input and a suggestions dropdown

🗓️ 7-day daily forecast — click any day to see its data

⏱️ Hourly forecast sidebar — shows remaining hours of the day, spills into the next day if less than 8 hours are left

🌡️ Metric / Imperial toggle — switch between °C/°F, km/h/mph, mm/in instantly

⚡ Race condition protection — if you search a city while geolocation is still loading, the city result always wins


📱 Fully responsive — works on mobile, tablet, and desktop

🔁 Retry on error — if the API fails, one click brings everything back

🛠️ Built With : 

Vanilla JavaScript (ES Modules)

Open-Meteo — weather forecast API (free, no key needed)

Open-Meteo Geocoding — city search API

Nominatim / OpenStreetMap — reverse geocoding (coords → city name)

HTML & CSS — no frameworks, no libraries

📁 Project Structure : 

-> index.html

-> style.css

->  js/
    
    app.js         # Main controller — events, geolocation, data flow
    
    renderHTML.js  # All DOM rendering functions
    
    logic.js       # WMO codes, unit helpers, formatters
    
    api.js         # All API calls (weather, geocoding, reverse)
    
     state.js       # Single source of truth for app state

🧠 How It Works: 

->On load the app requests your location. If you allow it, it fetches weather for your coordinates. If you deny, it shows a message and lets you search instead.

->Typing in the search box triggers a debounced API call to the geocoding endpoint after 400ms and shows suggestions.

->Selecting a city fetches weather data and renders everything — main card, stats, daily forecast, and hourly sidebar.

->Clicking a daily forecast card updates the whole UI to show that day's data pulled from the hourly array.

->The units toggle instantly re-renders all values without any new API calls.

⚙️ Running Locally : 

No build tools needed. Just clone and open with a local server:

git clone https://github.com/your-username/weather-now.git
cd weather-now

Then open with VS Code Live Server or any static server. Opening index.html directly as a file won't work because ES Modules require a server.

🤝 APIs Used : 

Open-Meteo -> ForecastWeather data -> Free

Open-Meteo Geocoding ->  City search -> Free

Nominatim (OSM) -> Reverse geocoding  -> Free

All APIs used are completely free with no API key required.

💡 What I Learned : 

How to work with multiple APIs together in one project

Managing app state manually without any framework

Handling async race conditions (geolocation vs city search)

Making UI accessible for keyboard users

Debouncing input to avoid hammering an API

How ES Modules work in the browser




