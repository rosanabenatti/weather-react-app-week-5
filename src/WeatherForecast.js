import React from "react";
import WeatherIcon from "./WeatherIcon";
import "./WeatherForecast.css";

export default function WeatherForecast({ forecast }) {
  const dailyForecast = forecast.slice(1, 8);

  return (
    <div className="forecast-container">
      <div className="forecast-grid">
        {dailyForecast.map((day, index) => (
          <div key={index} className="forecast-item">
            <p className="forecast-day">
              {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                weekday: "short",
              })}
            </p>
            <WeatherIcon code={day.weather[0].icon} size={36} />
            <p className="forecast-max-temp">{Math.round(day.temp.max)}°C</p>
            <p className="forecast-min-temp">{Math.round(day.temp.min)}°C</p>
          </div>
        ))}
      </div>
    </div>
  );
}
