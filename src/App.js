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
  const [unit, setUnit] = useState("metric"); // Default to Celsius
  const [searchedCity, setSearchedCity] = useState(false); // Track if the user has searched for a city

  const apiKey = "f560c295de51dc458df8b1c23e4beea3";

  // Get weather based on coordinates (latitude and longitude)
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

  // Get weather based on city name
  const fetchWeatherByCity = (city, newUnit) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${newUnit}&appid=${apiKey}`;

    axios
      .get(url)
      .then((response) => {
        setData(response.data);
        setSearchedCity(true); // Track that the user has searched for a city
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
        alert("Location not found. Please try again.");
      });
  };

  // Use Geolocation API to get user's current location on page load
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
        { enableHighAccuracy: true } // Enable high accuracy mode
      );
    } else {
      setLoading(false);
    }
  }, [searchedCity]); // Only fetch by geolocation if the user hasn't searched for a city

  // Fetch weather by user's coordinates when latitude and longitude are set
  useEffect(() => {
    if (!searchedCity && lat && lon) {
      fetchWeatherByCoords(lat, lon, unit); // Call the weather fetch function using geolocation
    }
  }, [lat, lon, unit, fetchWeatherByCoords, searchedCity]);

  // Function to search weather by city name
  const searchLocation = (event) => {
    if (event.key === "Enter") {
      fetchWeatherByCity(location, unit); // Fetch weather by the searched city name
      setLocation(""); // Clear the input after the search
    }
  };

  // Toggle between Celsius and Fahrenheit
  const toggleUnit = (newUnit) => {
    setUnit(newUnit); // Update the unit state
    // Refetch the weather data with the new unit without changing the city
    if (searchedCity) {
      fetchWeatherByCity(data.name, newUnit); // Refetch using the typed city name with the new unit
    } else if (lat && lon) {
      fetchWeatherByCoords(lat, lon, newUnit); // Refetch using coordinates with the new unit
    }
  };

  // Function to map weather description to Font Awesome icons
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

  // Determine the unit symbol based on the state
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
