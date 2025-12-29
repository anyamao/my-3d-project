const API_BASE_URL = "/api/weather";

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
  timezone: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  dt: number;
  visibility?: number;
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
      `${API_BASE_URL}?city=${encodeURIComponent(city)}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch weather");
    }

    return response.json();
  }

  static formatTimeWithTimezone(
    unixTimestamp: number,
    timezoneOffset: number
  ): string {
    const date = new Date((unixTimestamp + timezoneOffset) * 1000);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  }

  static formatLocalTime(unixTimestamp: number): string {
    return new Date(unixTimestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  static getLocalTimeFromUTC(
    unixTimestamp: number,
    timezoneOffset: number
  ): Date {
    return new Date((unixTimestamp + timezoneOffset) * 1000);
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

  static isNightTime(weatherData: WeatherData): boolean {
    if (
      !weatherData.sys?.sunrise ||
      !weatherData.sys?.sunset ||
      !weatherData.dt ||
      weatherData.timezone === undefined
    ) {
      return false;
    }

    const currentUtc = weatherData.dt;
    const sunriseUtc = weatherData.sys.sunrise;
    const sunsetUtc = weatherData.sys.sunset;
    const timezoneOffset = weatherData.timezone;

    const currentLocal = currentUtc + timezoneOffset;
    const sunriseLocal = sunriseUtc + timezoneOffset;
    const sunsetLocal = sunsetUtc + timezoneOffset;

    const normalizedCurrent = currentLocal % 86400;
    const normalizedSunset = sunsetLocal % 86400;
    const normalizedSunrise = sunriseLocal % 86400;

    if (normalizedSunset < normalizedSunrise) {
      return (
        normalizedCurrent >= normalizedSunset &&
        normalizedCurrent < normalizedSunrise
      );
    } else {
      return (
        normalizedCurrent >= normalizedSunset ||
        normalizedCurrent < normalizedSunrise
      );
    }
  }

  static getCurrentCityTime(weatherData: WeatherData): string {
    if (!weatherData.dt || weatherData.timezone === undefined) return "N/A";

    const utcSeconds = weatherData.dt;
    const timezoneOffsetSeconds = weatherData.timezone;

    const localTimeMs = (utcSeconds + timezoneOffsetSeconds) * 1000;

    return new Date(localTimeMs).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  static getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  static getWeatherDescription(weatherId: number): string {
    if (weatherId >= 200 && weatherId < 300) return "thunderstorm";
    if (weatherId >= 300 && weatherId < 400) return "drizzle";
    if (weatherId >= 500 && weatherId < 600) return "rain";
    if (weatherId >= 600 && weatherId < 700) return "snow";
    if (weatherId >= 700 && weatherId < 800) return "atmosphere";
    if (weatherId === 800) return "clear";
    if (weatherId > 800 && weatherId < 900) return "clouds";
    return "unknown";
  }
  static hasPrecipitation(weatherId: number): boolean {
    if (weatherId >= 200 && weatherId < 300) return true;
    if (weatherId >= 300 && weatherId < 400) return true;
    if (weatherId >= 500 && weatherId < 600) return true;
    if (weatherId >= 600 && weatherId < 700) return true;
    return false;
  }

  static shouldPlayFirstHalf(weatherId: number): boolean {
    return this.hasPrecipitation(weatherId);
  }
}
