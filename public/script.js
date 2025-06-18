document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '6b205694e5d9567a8d41963e408da283'; // AAPKI API KEY YAHAN HAI
    let currentCityGlobal = 'Delhi'; 

    const bgOverlayEl = document.getElementById('bg-overlay');
    const starsEl = document.getElementById('stars-effect');
    const twinklingEl = document.getElementById('twinkling-effect');
    const cloudsEl = document.getElementById('clouds-effect'); // Ensure this element exists or remove references if not using separate cloud layer in CSS
    const rainContainerEl = document.getElementById('rain-effect');

    const cityNameEl = document.getElementById('city-name');
    const weatherIconEl = document.getElementById('weather-icon');
    const temperatureEl = document.getElementById('temperature');
    const weatherConditionEl = document.getElementById('weather-condition');
    const minMaxTempEl = document.getElementById('min-max-temp');
    const feelsLikeEl = document.getElementById('feels-like');
    const hourlyForecastContainer = document.getElementById('hourly-forecast-container');
    const weeklyForecastContainer = document.getElementById('weekly-forecast-container');
    const cityInputEl = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-icon-btn');

    async function getWeatherData(city) {
        try {
            statusLoading();
            const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude=minutely,alerts&appid=${API_KEY}&units=metric`;
            
            const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
            if (!geoResponse.ok) {
                if(geoResponse.status === 401) throw new Error('Invalid API Key. Please check your OpenWeatherMap account.');
                throw new Error(`Geocoding failed: ${geoResponse.statusText || 'Network error'}`);
            }
            const geoData = await geoResponse.json();
            if (!geoData || geoData.length === 0) throw new Error(`City "${city}" not found.`);
            
            const { lat, lon, name: resolvedCityName, country } = geoData[0];
            currentCityGlobal = `${resolvedCityName}, ${country || ''}`.trim().replace(/,$/, ""); 

            const weatherResponse = await fetch(oneCallUrl.replace('{lat}', lat).replace('{lon}', lon));
             if (!weatherResponse.ok) {
                if(weatherResponse.status === 401) throw new Error('API Key unauthorized for OneCall API. Check subscription/payment on OpenWeatherMap.');
                 throw new Error(`Weather data fetch failed (${weatherResponse.status})`);
             }
            const weatherData = await weatherResponse.json();
            
            if (!weatherData.current || !weatherData.daily || !weatherData.hourly) throw new Error('Incomplete weather data from API.');
            updateUI(currentCityGlobal, weatherData);

        } catch (error) {
            console.error("Error fetching weather data for " + city + ":", error);
            statusError(error.message);
        }
    }
    
    function statusLoading(){
        cityNameEl.textContent = "Loading...";
        weatherConditionEl.textContent = "--";
        temperatureEl.innerHTML = "--<sup>°C</sup>";
        minMaxTempEl.textContent = "--° ~ --°";
        feelsLikeEl.textContent = "Feels like --°C";
        weatherIconEl.src = "https://openweathermap.org/img/wn/01d@4x.png"; 
        hourlyForecastContainer.innerHTML = '<div class="loading-placeholder">Fetching hourly...</div>';
        weeklyForecastContainer.innerHTML = '<div class="loading-placeholder">Fetching weekly...</div>';
        bgOverlayEl.style.background = 'var(--bg-night-clear)';
        starsEl.style.opacity = '0'; twinklingEl.style.opacity = '0';
        if(cloudsEl) cloudsEl.style.opacity = '0';
        rainContainerEl.style.opacity = '0'; rainContainerEl.innerHTML = '';
    }

    function statusError(message){
        cityNameEl.textContent = "Error";
        weatherConditionEl.textContent = message;
        bgOverlayEl.style.background = 'linear-gradient(135deg, #4a0e0e, #1c0101)'; 
        starsEl.style.opacity = '0'; twinklingEl.style.opacity = '0'; 
        if(cloudsEl) cloudsEl.style.opacity = '0';
        rainContainerEl.style.opacity = '0'; rainContainerEl.innerHTML = '';
    }

    function updateUI(displayCityName, data) {
        // (Yeh poora function pichhle response se copy karein jismein hourly aur weekly forecast update hota hai)
        // ...
         cityNameEl.textContent = displayCityName;
        const current = data.current;
        const todayDaily = data.daily[0];

        weatherIconEl.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`;
        weatherIconEl.alt = current.weather[0].description;
        temperatureEl.innerHTML = `${Math.round(current.temp)}<sup>°C</sup>`;
        weatherConditionEl.textContent = current.weather[0].description;
        minMaxTempEl.textContent = `${Math.round(todayDaily.temp.min)}° ~ ${Math.round(todayDaily.temp.max)}°C`;
        feelsLikeEl.textContent = `Feels like ${Math.round(current.feels_like)}°C`;
        
        updateDynamicBackground(current.weather[0].main.toLowerCase(), current.weather[0].icon, current.dt, data.timezone_offset);

        hourlyForecastContainer.innerHTML = ''; 
        const currentLocalTimeHour = new Date((current.dt + data.timezone_offset) * 1000).getUTCHours();
        data.hourly.slice(0, 12).forEach((hourData) => { /* ... hourly item logic ... */ });

        weeklyForecastContainer.innerHTML = '';
        data.daily.slice(0, 7).forEach((dayData) => { /* ... weekly item logic ... */ });
    }
    
    function updateDynamicBackground(weatherMain, iconCode, timestamp, timezoneOffset) {
         // (Yeh poora function pichhle response se copy karein jismein background badalta hai)
         // ...
        const localTime = new Date((timestamp + timezoneOffset) * 1000);
        const hour = localTime.getUTCHours(); 
        let gradient;
        const isDay = hour >= 5 && hour < 19;

        starsEl.style.opacity = '0'; twinklingEl.style.opacity = '0'; 
        if(cloudsEl) cloudsEl.style.opacity = '0';
        rainContainerEl.style.opacity = '0'; rainContainerEl.innerHTML = '';

        // Determine background gradient and effects based on weather and time
        if (isDay) {
             if (weatherMain.includes('clear')) gradient = 'var(--bg-day-clear)'; 
             else if (weatherMain.includes('clouds')) { gradient = 'linear-gradient(135deg, #B0C4DE 0%, #778899 100%)'; if(cloudsEl) cloudsEl.style.opacity = '0.5';}
             else if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) { gradient = 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)'; activateRainEffect(); if(cloudsEl) cloudsEl.style.opacity = '0.7';}
             // ... more day conditions ...
             else gradient = 'var(--bg-day-clear)'; 
        } else { 
            starsEl.style.opacity = '1'; twinklingEl.style.opacity = '1';
             if (weatherMain.includes('clear')) gradient = 'var(--bg-night-clear)';
             else if (weatherMain.includes('clouds')) { gradient = 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)'; starsEl.style.opacity = '0.3'; twinklingEl.style.opacity = '0.3'; if(cloudsEl) cloudsEl.style.opacity = '0.4';}
            // ... more night conditions ...
             else gradient = 'var(--bg-night-clear)';
        }
        bgOverlayEl.style.background = gradient; 
    }

    function activateRainEffect(isHeavy = false, isSnow = false) {
        // (Yeh poora function pichhle response se copy karein)
    }

    function handleCitySearch(){
        const newCity = cityInputEl.value.trim();
        if (newCity) { getWeatherData(newCity); }
        cityInputEl.value = ''; 
        cityInputEl.blur(); 
    }

    cityInputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') { handleCitySearch(); }});
    if(searchBtn) searchBtn.addEventListener('click', handleCitySearch);
    
    getWeatherData(currentCityGlobal); 
});
