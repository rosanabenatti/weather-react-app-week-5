import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import WeatherForecast from "./WeatherForecast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faCloud,
  faCloudRain,
  faSnowflake,
  faBolt,
  faSmog,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";

function App() {
  const [data, setData] = useState({});
  const [forecast, setForecast] = useState(null);
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState("metric");
  const [searchedCity, setSearchedCity] = useState(false);
  const [dateTime, setDateTime] = useState("");

  const apiKey = "bb0df6985c2eab6a171d64a6bacbb4e1";

  // Fetch weather by coordinates
  const fetchWeatherByCoords = useCallback(
    (latitude, longitude, newUnit) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${newUnit}&appid=${apiKey}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,alerts&units=${newUnit}&appid=${apiKey}`;

      axios
        .get(url)
        .then((response) => {
          setData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching weather data:", error);
          setLoading(false);
        });

      axios
        .get(forecastUrl)
        .then((response) => {
          setForecast(response.data.daily);
        })
        .catch((error) => {
          console.error("Error fetching forecast data:", error);
        });
    },
    [apiKey]
  );

  // Fetch weather by city name
  const fetchWeatherByCity = useCallback(
    (city, newUnit) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${newUnit}&appid=${apiKey}`;

      axios
        .get(url)
        .then((response) => {
          setData(response.data);
          setSearchedCity(true);
          fetchWeatherByCoords(
            response.data.coord.lat,
            response.data.coord.lon,
            newUnit
          );
        })
        .catch((error) => {
          console.error("Error fetching weather data:", error);
          alert("Location not found. Please try again.");
        });
    },
    [fetchWeatherByCoords, apiKey]
  );

  // Update date and time every minute
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = { weekday: "long", hour: "2-digit", minute: "2-digit" };
      setDateTime(now.toLocaleDateString("en-US", options));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Handle geolocation or default to a city
  useEffect(() => {
    if (!searchedCity) {
      if (navigator.geolocation) {
        setLoading(true); // Show loading while fetching geolocation

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLat(position.coords.latitude);
            setLon(position.coords.longitude);
          },
          (error) => {
            console.error("Error fetching geolocation:", error);
            alert("Could not get your location. Defaulting to London.");
            fetchWeatherByCity("London", unit); // Default to London if geolocation fails
          },
          { enableHighAccuracy: true }
        );
      } else {
        alert(
          "Geolocation not supported by your browser. Defaulting to London."
        );
        fetchWeatherByCity("London", unit); // Default to London if geolocation not supported
      }
    }
  }, [searchedCity, unit, fetchWeatherByCity]);

  // Fetch weather by coordinates when lat/lon change
  useEffect(() => {
    if (!searchedCity && lat && lon) {
      fetchWeatherByCoords(lat, lon, unit);
    }
  }, [lat, lon, unit, fetchWeatherByCoords, searchedCity]);

  // Handle manual city search input
  const searchLocation = (event) => {
    if (event.key === "Enter") {
      fetchWeatherByCity(location, unit);
      setLocation("");
    }
  };

  // Toggle between Celsius and Fahrenheit
  const toggleUnit = (newUnit) => {
    setUnit(newUnit);

    if (searchedCity) {
      fetchWeatherByCity(data.name, newUnit);
    } else if (lat && lon) {
      fetchWeatherByCoords(lat, lon, newUnit);
    }
  };

  // Weather icon rendering
  const getWeatherIcon = (description) => {
    switch (description) {
      case "Clouds":
        return <FontAwesomeIcon icon={faCloud} />;
      case "Clear":
        return <FontAwesomeIcon icon={faSun} />;
      case "Rain":
        return <FontAwesomeIcon icon={faCloudRain} />;
      case "Snow":
        return <FontAwesomeIcon icon={faSnowflake} />;
      case "Thunderstorm":
        return <FontAwesomeIcon icon={faBolt} />;
      case "Mist":
      case "Smoke":
      case "Haze":
      case "Dust":
      case "Fog":
      case "Sand":
      case "Ash":
        return <FontAwesomeIcon icon={faSmog} />;
      case "Night":
        return <FontAwesomeIcon icon={faMoon} />;
      default:
        return null;
    }
  };

  const unitSymbol = unit === "metric" ? "°C" : "°F";

  const convertWindSpeed = (speed, unit) => {
    if (unit === "metric") {
      return Math.round(speed * 3.6);
    } else if (unit === "imperial") {
      return Math.round(speed * 2.237);
    }
    return speed;
  };

  return (
    <div className="app">
      <div className="container">
        <div className="top">
          <div className="search">
            {!searchedCity && !loading && (
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                onKeyPress={searchLocation}
                placeholder="Enter Location"
                type="text"
              />
            )}
          </div>

          {loading ? (
            <div className="loading">
              <p>Loading forecast...</p>
              {/* Optional spinner */}
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              <div className="location">
                <p>{data.name}</p>
                <p className="date-time">{dateTime}</p>
              </div>
              <div className="temp">
                {data.main ? (
                  <h1>
                    {data.main.temp.toFixed()}
                    <span className="unit">
                      <button
                        className={unit === "metric" ? "active" : ""}
                        onClick={() => toggleUnit("metric")}
                      >
                        °C
                      </button>
                      |
                      <button
                        className={unit === "imperial" ? "active" : ""}
                        onClick={() => toggleUnit("imperial")}
                      >
                        °F
                      </button>
                    </span>
                  </h1>
                ) : null}
              </div>
              <div className="description">
                {data.weather ? (
                  <p>
                    {getWeatherIcon(data.weather[0].main)}{" "}
                    {data.weather[0].main}
                  </p>
                ) : null}
              </div>
            </>
          )}
        </div>

        {data.name && forecast ? (
          <div className="bottom">
            <div className="weather-details">
              <div className="feels">
                {data.main && data.main.feels_like ? (
                  <p className="bold">
                    {Math.round(data.main.feels_like)}
                    {unitSymbol}
                  </p>
                ) : (
                  <p>N/A</p>
                )}
                <p>Feels Like</p>
              </div>

              <div className="humidity">
                {data.main ? (
                  <p className="bold">{data.main.humidity}%</p>
                ) : null}
                <p>Humidity</p>
              </div>

              <div className="wind">
                {data.wind ? (
                  <p className="bold">
                    {convertWindSpeed(data.wind.speed, unit)}{" "}
                    {unit === "metric" ? "km/h" : "mph"}
                  </p>
                ) : null}
                <p>Wind</p>
              </div>
            </div>

            <WeatherForecast forecast={forecast} />
          </div>
        ) : (
          <p>Loading forecast...</p>
        )}
      </div>

      <div className="footer">
        <footer>
          This project was coded by{" "}
          <a
            href="https://github.com/rosanabenatti"
            target="_blank"
            rel="noopener noreferrer"
          >
            Rosana Benatti
          </a>{" "}
          and is <br />
          <a
            href="https://github.com/rosanabenatti/weather-react-app-week-5"
            target="_blank"
            rel="noopener noreferrer"
          >
            open-sourced on GitHub
          </a>{" "}
          and{" "}
          <a
            href="https://react-wheater-app-geo.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            hosted on Netlify.
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;
