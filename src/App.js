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
  const [forecastData, setForecastData] = useState([]); // State for 7-day forecast
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState("metric");
  const [searchedCity, setSearchedCity] = useState(false);

  const apiKey = "f560c295de51dc458df8b1c23e4beea3";

  // Fetch weather and forecast by coordinates
  const fetchWeatherByCoords = useCallback((latitude, longitude, newUnit) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${newUnit}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,alerts&units=${newUnit}&appid=${apiKey}`;

    // Fetch current weather
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

    // Fetch 7-day forecast
    axios
      .get(forecastUrl)
      .then((response) => {
        console.log("Forecast API Response: ", response.data);
        setForecastData(response.data.daily); // Get daily forecast and set state
      })
      .catch((error) => {
        console.error("Error fetching forecast data:", error);
      });
  }, []);

  // Fetch weather by city name
  const fetchWeatherByCity = (city, newUnit) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${newUnit}&appid=${apiKey}`;

    axios
      .get(url)
      .then((response) => {
        setData(response.data);
        const { lat, lon } = response.data.coord; // Get lat and lon from the city's weather data
        setSearchedCity(true);

        // Fetch 7-day forecast using the city's coordinates
        fetchWeatherByCoords(lat, lon, newUnit);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
        alert("Location not found. Please try again.");
      });
  };

  // Geolocation API to get user coordinates
  useEffect(() => {
    if (!searchedCity && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLon(position.coords.longitude);
        },
        (error) => {
          console.error("Error fetching geolocation:", error);
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLoading(false);
    }
  }, [searchedCity]);

  // Trigger fetch based on location changes
  useEffect(() => {
    if (!searchedCity && lat && lon) {
      fetchWeatherByCoords(lat, lon, unit);
    }
  }, [lat, lon, unit, fetchWeatherByCoords, searchedCity]);

  // Search for location
  const searchLocation = (event) => {
    if (event.key === "Enter") {
      fetchWeatherByCity(location, unit);
      setLocation("");
    }
  };

  // Toggle between metric and imperial units
  const toggleUnit = (newUnit) => {
    setUnit(newUnit);

    if (searchedCity) {
      fetchWeatherByCity(data.name, newUnit);
    } else if (lat && lon) {
      fetchWeatherByCoords(lat, lon, newUnit);
    }
  };

  // Convert wind speed based on the unit
  const convertWindSpeed = (speed, unit) => {
    if (unit === "metric") {
      return Math.round(speed * 3.6); // Convert meters per second to km/h
    } else if (unit === "imperial") {
      return Math.round(speed * 2.237); // Convert meters per second to mph
    }
    return speed; // Return the original value if no unit conversion is needed
  };

  // Get weather icon based on description
  function getWeatherIcon(description) {
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
  }

  const unitSymbol = unit === "metric" ? "°C" : "°F";

  return (
    <div className="app">
      <div className="container">
        <div className="top">
          <div className="search">
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              onKeyPress={searchLocation}
              placeholder="Enter Location"
              type="text"
            />
          </div>
          {loading ? (
            <p>Loading weather...</p>
          ) : (
            <>
              <div className="location">
                <p>{data.name}</p>
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

        {data.name && (
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

            <br />
            {/* Pass forecastData to WeatherForecast */}
            <WeatherForecast forecast={forecastData} unit={unit} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
