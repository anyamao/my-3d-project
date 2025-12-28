const API_BASE_URL = "http://localhost:5001/api/weather";

export interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  name: string;
  sys: {
    country: string;
  };
  dt: number;
}

export interface ForecastData {
  list: Array<{
    dt: number;
    main: WeatherData["main"];
    weather: WeatherData["weather"];
    wind: WeatherData["wind"];
    dt_txt: string;
  }>;
  city: {
    name: string;
    country: string;
  };
}

export class WeatherService {
  static async getCurrentWeather(city: string): Promise<WeatherData> {
    const response = await fetch(
      `${API_BASE_URL}/current/${encodeURIComponent(city)}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch weather");
    }

    return response.json();
  }

  static async getWeatherByCoords(
    lat: number,
    lon: number
  ): Promise<WeatherData> {
    const response = await fetch(
      `${API_BASE_URL}/current/coordinates?lat=${lat}&lon=${lon}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch weather");
    }

    return response.json();
  }

  static async getForecast(city: string): Promise<ForecastData> {
    const response = await fetch(
      `${API_BASE_URL}/forecast/${encodeURIComponent(city)}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch forecast");
    }

    return response.json();
  }

  static getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  static getWeatherDescription(weatherId: number): string {
    // Map weather IDs to descriptions
    if (weatherId >= 200 && weatherId < 300) return "thunderstorm";
    if (weatherId >= 300 && weatherId < 400) return "drizzle";
    if (weatherId >= 500 && weatherId < 600) return "rain";
    if (weatherId >= 600 && weatherId < 700) return "snow";
    if (weatherId >= 700 && weatherId < 800) return "atmosphere";
    if (weatherId === 800) return "clear";
    if (weatherId > 800 && weatherId < 900) return "clouds";
    return "unknown";
  }
}
