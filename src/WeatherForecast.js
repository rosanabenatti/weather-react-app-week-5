import React from "react";
import "./WeatherForecast.css";

export default function WeatherForecast(props) {
  console.log(props.forecast);

  if (!props.forecast || props.forecast.length === 0) {
    return <p>Loading forecast...</p>; // Or you can return null or a loading spinner
  }

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDay = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
    return daysOfWeek[date.getDay()]; // Get day of the week (Sun, Mon, etc.)
  };

  return (
    <div className="forecast-container">
      <div className="forecast-grid">
        {props.forecast.map((day, index) => (
          <div key={index} className="forecast-item">
            {/* First line: Day of the Week */}
            <p className="forecast-day">{getDay(day.dt)}</p>
            {/* Second line: Weather Icon */}
            <p className="forecast-icon">
              <img
                src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                alt={day.weather[0].description}
              />
            </p>
            {/* Third line: Max and Min Temperatures */}
            <p className="forecast-temps">
              {Math.round(day.temp.max)}
              {props.unit === "metric" ? "°C" : "°F"} /{" "}
              {Math.round(day.temp.min)}
              {props.unit === "metric" ? "°C" : "°F"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
