import React, { useState } from "react";

function Weather() {
  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");

  const API_KEY = "85e668855892b8b623c50486f9d83a08"; // 🔐 paste your key here

  const now = new Date().toLocaleString();

  // 🔍 Suggestions
  const getSuggestions = async (value) => {
    setCity(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=5&appid=${API_KEY}`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch {
      console.log("Suggestion error");
    }
  };

  // 🌦 Weather by coordinates (main accurate method)
  const getWeatherByCoords = async (lat, lon) => {
    try {
      setError("");

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      const result = await res.json();

      if (result.cod !== 200) {
        setError("Location not found");
        return;
      }

      setData(result);
      setCity(result.name);
    } catch {
      setError("Error fetching data");
    }
  };

  // 🔎 Manual search
  const getWeather = async () => {
    if (!city) return;

    try {
      setError("");

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      const result = await res.json();

      if (result.cod !== 200) {
        setError("City not found");
        return;
      }

      setData(result);
    } catch {
      setError("Error fetching data");
    }
  };

  // 📍 ACCURATE LIVE LOCATION (YOUR VERSION)
  const getLocationWeather = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setError("Detecting precise location...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        console.log("Lat:", latitude);
        console.log("Lon:", longitude);
        console.log("Accuracy (meters):", accuracy);

        if (accuracy > 1000) {
          setError("Low accuracy location. Turn on GPS for better results.");
        }

        getWeatherByCoords(latitude, longitude);
      },
      (err) => {
        if (err.code === 1) {
          setError("Please allow location access");
        } else {
          setError("Location failed");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };
  const getTempTheme = () => {
  if (!data) return "default";

  const temp = data.main.temp;

  if (temp > 35) return "hot";
  if (temp > 20) return "warm";
  if (temp > 10) return "cool";
  return "cold";
};

  return (
    <div className={`app ${getTempTheme()}`}>
      <div className="main-card">

        <div className="header">
          <h1>Weather Dashboard</h1>
          <p>{now}</p>
        </div>

        <div className="search-box">
          <input
            value={city}
            onChange={(e) => getSuggestions(e.target.value)}
            placeholder="Enter city"
          />

          <button onClick={getWeather}>Search</button>

          <button onClick={getLocationWeather}>
            Use Location
          </button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="suggestion-item"
                onClick={() => {
                  setSuggestions([]);
                  getWeatherByCoords(s.lat, s.lon);
                }}
              >
                {s.name}, {s.state || ""}, {s.country}
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && <p className="error">{error}</p>}

        {/* Weather */}
        {data && data.main && (
          <div className="weather-box">

            <div className="top-section">
              <h2>{data.name}, {data.sys.country}</h2>
              <h1>{data.main.temp}°C</h1>
               <p className={`weather-tag ${data.weather[0].main.toLowerCase()}`}>
  {data.weather[0].description}
</p>
            </div>

            <div className="info-grid">

              <div className="info-card blue">
                <p className="label">Feels Like</p>
                <p className="value">{data.main.feels_like}°C</p>
              </div>

              <div className="info-card green">
                <p className="label">Humidity</p>
                <p className="value">{data.main.humidity}%</p>
              </div>

              <div className="info-card orange">
                <p className="label">Pressure</p>
                <p className="value">{data.main.pressure} hPa</p>
              </div>

              <div className="info-card purple">
                <p className="label">Wind</p>
                <p className="value">{data.wind.speed} m/s</p>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
  
}

export default Weather;