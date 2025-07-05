import { useState, useEffect } from "react";
import { getWeatherUrl } from "../api/weather";

function groupByDateTime(items) {
  const grouped = {};

  items.forEach(({ fcstDate, fcstTime, category, fcstValue }) => {
    const key = `${fcstDate}_${fcstTime}`;

    if (!grouped[key]) {
      grouped[key] = {
        fcstDate,
        fcstTime,
        categories: {},
      };
    }

    grouped[key].categories[category] = fcstValue;
  });

  return grouped;
}

export function useWeatherData(lat, lon) {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    if (lat === null || lon === null) {
      return;
    }

    const url = getWeatherUrl(lat, lon);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (
          data &&
          data.response &&
          data.response.body &&
          data.response.body.items &&
          data.response.body.items.item
        ) {
          const grouped = groupByDateTime(data.response.body.items.item);
          setWeatherData(grouped);
        } else {
          setWeatherData(null);
        }
      })
      .catch(() => {
        setWeatherData(null);
      });
  }, [lat, lon]);

  return weatherData;
}
