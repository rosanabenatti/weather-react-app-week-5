import React from "react";
import WeatherIcon from "./WeatherIcon";
import "./WeatherForecast.css";

export default function WeatherForecast(props) {
  const forecastData = props.forecast;

  if (!forecastData || forecastData.length === 0) {
    return <p>Loading forecast...</p>; // Handle the case where forecast data is not available
  }

  // Slice the array to skip today's forecast
  const dailyForecast = forecastData.slice(1, 8); // Next 7 days

  return (
    <div className="forecast-container">
      <div className="forecast-grid">
        {dailyForecast.map((day, index) => (
          <div key={index} className="forecast-item">
            {/* Day of the Week */}
            <p className="forecast-day">
              {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                weekday: "short",
              })}
            </p>

            {/* Weather Icon */}
            <WeatherIcon code={day.weather[0].icon} size={36} />

            {/* Max Temperature */}
            <p className="forecast-max-temp">{Math.round(day.temp.max)}°C</p>

            {/* Min Temperature */}
            <p className="forecast-min-temp">{Math.round(day.temp.min)}°C</p>
          </div>
        ))}
      </div>
    </div>
  );
}
