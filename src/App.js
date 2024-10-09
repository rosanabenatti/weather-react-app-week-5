import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState("metric");
  const [searchedCity, setSearchedCity] = useState(false);

  const apiKey = "f560c295de51dc458df8b1c23e4beea3";

  const fetchWeatherByCoords = useCallback((latitude, longitude, newUnit) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${newUnit}&appid=${apiKey}`;

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
  }, []);
  const fetchWeatherByCity = (city, newUnit) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${newUnit}&appid=${apiKey}`;

    axios
      .get(url)
      .then((response) => {
        setData(response.data);
        setSearchedCity(true);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
        alert("Location not found. Please try again.");
      });
  };

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

  useEffect(() => {
    if (!searchedCity && lat && lon) {
      fetchWeatherByCoords(lat, lon, unit);
    }
  }, [lat, lon, unit, fetchWeatherByCoords, searchedCity]);

  const searchLocation = (event) => {
    if (event.key === "Enter") {
      fetchWeatherByCity(location, unit);
      setLocation("");
    }
  };

  const toggleUnit = (newUnit) => {
    setUnit(newUnit);

    if (searchedCity) {
      fetchWeatherByCity(data.name, newUnit);
    } else if (lat && lon) {
      fetchWeatherByCoords(lat, lon, newUnit);
    }
  };

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
            <div className="feels">
              {data.main ? (
                <p className="bold">
                  {data.main.feels_like.toFixed()}
                  {unitSymbol}
                </p>
              ) : null}
              <p>Feels Like</p>
            </div>
            <div className="humidity">
              {data.main ? <p className="bold">{data.main.humidity}%</p> : null}
              <p>Humidity</p>
            </div>
            <div className="wind">
              {data.wind ? (
                <p className="bold">{data.wind.speed.toFixed()} km/h</p>
              ) : null}
              <p>Wind</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
