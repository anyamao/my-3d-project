import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Sun,
  Moon,
  Wind,
  CloudRain,
  Droplet,
  Settings,
  PersonStanding,
  Cloud,
  CloudSnow,
  CloudLightning,
} from "lucide-react";
import { WeatherService, WeatherData } from "../../services/WeatherService";

interface AnimationControlsProps {
  onPlayToFrame50: () => void;
  onPlayFromFrame50ToEnd: () => void;
  canPlayToFrame50: boolean;
  canPlayFromFrame50ToEnd: boolean;
  currentFrame: number;
  isAnimationComplete: boolean;
  isAnimationPlaying: boolean;
  onWeatherChange?: (
    weatherType: "none" | "snow" | "rain",
    intensity: number
  ) => void;
  onWeatherSearch?: (weatherData: WeatherData) => Promise<void>;
  onResetCamera?: () => void;
  onToggleNightMode?: () => void;
  isNightMode?: boolean;
}

const AnimationControls: React.FC<AnimationControlsProps> = ({
  onPlayToFrame50,
  onPlayFromFrame50ToEnd,
  canPlayToFrame50,
  canPlayFromFrame50ToEnd,
  currentFrame,
  isAnimationComplete,
  isAnimationPlaying,
  onWeatherChange,
  onWeatherSearch,
  onResetCamera,
  onToggleNightMode,
  isNightMode = false,
}) => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCelsius, setIsCelsius] = useState(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSearchEnabled, setIsSearchEnabled] = useState(true);
  const [animationState, setAnimationState] = useState<
    "idle" | "playingFirstHalf" | "pausedAt50" | "playingSecondHalf"
  >("idle");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePersonStandingClick = () => {
    if (onResetCamera) onResetCamera();
  };
  const handleMoonClick = () => {
    if (onToggleNightMode) onToggleNightMode();
  };

  useEffect(() => {
    if (isAnimationPlaying) {
      if (currentFrame < 50) {
        setAnimationState("playingFirstHalf");
        setIsSearchEnabled(false);
      } else if (currentFrame >= 50 && !isAnimationComplete) {
        setAnimationState("playingSecondHalf");
        setIsSearchEnabled(false);
      }
    } else {
      if (currentFrame === 50) {
        setAnimationState("pausedAt50");
        setIsSearchEnabled(true);
      } else if (isAnimationComplete) {
        setAnimationState("idle");
        setIsSearchEnabled(true);
      } else {
        setAnimationState("idle");
        setIsSearchEnabled(true);
      }
    }
  }, [currentFrame, isAnimationPlaying, isAnimationComplete]);

  useEffect(() => {
    fetchDefaultWeather();
  }, []);

  const fetchDefaultWeather = async () => {
    try {
      const defaultWeather = await WeatherService.getCurrentWeather("London");
      setWeather(defaultWeather);
      update3DWeather(defaultWeather);

      if (defaultWeather.weather.length > 0) {
        const weatherId = defaultWeather.weather[0].id;
        if (WeatherService.shouldPlayFirstHalf(weatherId)) {
          onPlayToFrame50?.();
        }
      }
    } catch (err) {
      console.error("Failed to load default weather:", err);
    }
  };

  const update3DWeather = (weatherData: WeatherData) => {
    if (!onWeatherChange || !weatherData.weather.length) return;

    const weatherId = weatherData.weather[0].id;
    const description = WeatherService.getWeatherDescription(weatherId);

    let threeJsWeather: "none" | "snow" | "rain" = "none";
    let intensity = 0.5;

    if (description === "snow") {
      threeJsWeather = "snow";
      intensity = weatherData.main.temp < 0 ? 0.8 : 0.5;
    } else if (["rain", "drizzle", "thunderstorm"].includes(description)) {
      threeJsWeather = "rain";
      intensity = description === "thunderstorm" ? 0.9 : 0.6;
    }

    onWeatherChange(threeJsWeather, intensity);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !isSearchEnabled || isAnimationPlaying) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const weatherData = await WeatherService.getCurrentWeather(city);
        setWeather(weatherData);
        update3DWeather(weatherData);
        if (onWeatherSearch) {
          await onWeatherSearch(weatherData);
        }
        if (weatherData.weather.length > 0) {
          const weatherId = weatherData.weather[0].id;
          const hasPrecipitation = WeatherService.hasPrecipitation(weatherId);

          if (hasPrecipitation && animationState === "idle") {
            onPlayToFrame50?.();
          } else if (!hasPrecipitation && animationState === "pausedAt50") {
            onPlayFromFrame50ToEnd?.();
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch weather");
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSearchEnabled) return;
    setCity(e.target.value);
    setError("");
  };

  const getAnimationStatus = () => {
    switch (animationState) {
      case "playingFirstHalf":
        return "Panda is seeking shelter...";
      case "pausedAt50":
        return "Panda is waiting for clear weather...";
      case "playingSecondHalf":
        return "Panda is coming out...";
      case "idle":
        return `Ready for weather search`;
      default:
        return "";
    }
  };

  const getWeatherIcon = (weatherId?: number) => {
    if (!weatherId && weather) {
      weatherId = weather.weather[0].id;
    }

    const description = weatherId
      ? WeatherService.getWeatherDescription(weatherId)
      : "clear";

    switch (description) {
      case "clear":
        return (
          <Sun className="text-yellow-400 pointer-events-none w-[100px] h-[100px] mr-[-15px]" />
        );
      case "clouds":
        return (
          <Cloud className="text-blue-400 pointer-events-none w-[100px] h-[100px] mr-[-15px]" />
        );
      case "rain":
      case "drizzle":
        return (
          <CloudRain className="text-blue-400 pointer-events-none w-[100px] h-[100px] mr-[-15px]" />
        );
      case "snow":
        return (
          <CloudSnow className="text-blue-300 pointer-events-none w-[100px] h-[100px] mr-[-15px]" />
        );
      case "thunderstorm":
        return (
          <CloudLightning className="text-purple-400 pointer-events-none w-[100px] h-[100px] mr-[-15px]" />
        );
      default:
        return (
          <Sun className="text-yellow-400 pointer-events-none w-[100px] h-[100px] mr-[-15px]" />
        );
    }
  };

  const getTemperature = () => {
    if (!weather) return { celsius: 15, fahrenheit: 59 };

    const celsius = Math.round(weather.main.temp);
    const fahrenheit = Math.round((celsius * 9) / 5 + 32);
    return { celsius, fahrenheit };
  };

  const getWindSpeed = () => {
    if (!weather) return "12 m/s";
    return `${Math.round(weather.wind.speed)} m/s`;
  };

  const getHumidity = () => {
    if (!weather) return "40%";
    return `${weather.main.humidity}%`;
  };

  const getRainChance = () => {
    if (!weather) return "30%";

    const weatherId = weather.weather[0].id;
    const description = WeatherService.getWeatherDescription(weatherId);

    if (description === "rain" || description === "drizzle") return "80%";
    if (description === "thunderstorm") return "90%";
    if (weather.main.humidity > 80) return "60%";
    return "30%";
  };

  const getWeatherDescription = () => {
    if (!weather || !weather.weather.length) return "Sunny";
    return (
      weather.weather[0].description.charAt(0).toUpperCase() +
      weather.weather[0].description.slice(1)
    );
  };

  const temperature = getTemperature();
  const cityName = weather
    ? `${weather.name}, ${weather.sys.country}`
    : "London";
  const weatherDescription = getWeatherDescription();

  return (
    <div className="relative top-0 mt-[-30px] ml-[20px] flex z-10 ">
      <a
        style={{ transitionDelay: "200ms" }}
        className={` ${
          isMounted
            ? "opacity-100 translate-y-0 duration-1000"
            : "opacity-0 -translate-y-20 "
        } 
          text-[16px] fixed text-white z-30 top-0 right-0 mt-[20px] mr-[125px] lg:mr-[175px] xl:mr-[375px] transition-all duration-300 cursor-pointer hover:underline`}
        href="https://t.me/anyamaoo"
      >
        anyamao's weather app
      </a>

      <PersonStanding
        onClick={handlePersonStandingClick}
        className="fixed text-white w-[25px] h-[25px] top-0 right-0 mt-[20px] hover:scale-125 transition-translate duration-300 transition-all hover:rotate-45 cursor-pointer mr-[85px] lg:mr-[135px] xl:mr-[335px] z-30"
      />
      <Moon
        onClick={handleMoonClick}
        className={` ${
          isNightMode ? "" : "hidden"
        } fixed text-white w-[25px] h-[25px] top-0 right-0 mt-[20px] hover:scale-125 transition-translate duration-300 transition-all hover:rotate-45 cursor-pointer mr-[50px] lg:mr-[100px] xl:mr-[300px] z-30`}
      />
      <Sun
        onClick={handleMoonClick}
        className={`fixed ${
          isNightMode ? "hidden" : ""
        } text-white w-[25px] h-[25px] top-0 right-0 mt-[20px] hover:scale-125 transition-translate duration-300 transition-all hover:rotate-45 cursor-pointer mr-[50px] lg:mr-[100px] xl:mr-[300px] z-30`}
      />

      <Settings className="text-lime-600 w-[25px] h-[25px] fixed top-0 right-0 mt-[20px] hover:scale-125 transition-translate duration-300 transition-all hover:rotate-45 cursor-pointer mr-[10px] lg:mr-[60px] xl:mr-[260px] z-30" />
      <img
        src={` ${
          animationState === "idle" || animationState === "playingSecondHalf"
            ? "panda_out.png"
            : "/panda_in_house.png"
        }`}
        alt="panda"
        className=" w-[120px] h-[120px] fixed bottom-0 right-0 mb-[20px] pointer-event-none mr-[10px] lg:mr-[60px] xl:mr-[260px] z-30"
      />

      <div className="text-[16px] min-w-[200px]   text-white fixed flex items-center justify-center top-0 mt-[40px] transition-all duration-300 ml-[150px]  lg:ml-[175px] xl:ml-[405px] left-0">
        {getAnimationStatus()}
      </div>
      <img
        alt="Dashboard"
        src="./Dashboard.png"
        className="w-[540px] transition-all duration-300 fixed top-0 mt-[-50px] ml-[-20px] lg:ml-[10px] xl:ml-[240px] min-w-[540px] flex z-10 pointer-events-none"
      />
      <div
        className={` ${
          weatherDescription === "Snow" || weatherDescription === "Light snow"
            ? "bg-white"
            : ""
        }
            ${weatherDescription === "Thunderstorm" ? "bg-black" : ""}
            ${
              weatherDescription === "Drizzle" ||
              weatherDescription === "Rain" ||
              weatherDescription === "Light Rain"
                ? "bg-blue-500"
                : ""
            }  bg-none  transition-all duration-300  w-full h-full fixed z-15 top-0 left-0 opacity-20 pointer-events-none`}
      ></div>

      <div
        className={` ${
          isNightMode ? "bg-black" : ""
        }  bg-none transition-all duration-300 w-full h-full fixed z-40 top-0 left-0 opacity-30 pointer-events-none`}
      ></div>

      <div className="fixed top-0 mt-[110px] ml-[105px] transition-all duration-300  lg:ml-[135px] xl:ml-[365px] w-[280px] flex flex-col z-20">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full">
          <div className="w-full h-[40px] flex items-center shadow-md rounded-full bg-white bg-opacity-70 p-[10px] mt-[5px]">
            <Search className="text-lime-700 mr-[10px] w-[20px] hover:scale-110 transition-translate duration-300" />
            <input
              type="text"
              placeholder={
                !isSearchEnabled
                  ? "Wait for animation to finish..."
                  : "Type your city here..."
              }
              className="outline-none bg-transparent text-[15px] text-gray-600 flex-1"
              value={city}
              onChange={handleInputChange}
              disabled={loading}
            />
            {loading && (
              <div className="w-4 h-4 border-2 border-lime-600 border-t-transparent rounded-full animate-spin ml-2" />
            )}
          </div>

          {error && (
            <div className="mt-2 text-red-500 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </form>
        <div
          className={`w-full flex ${
            error ? "mt-[-10px]" : "mt-[15px]"
          } justify-between border-b-[1px] border-b-gray-300 p-[10px] pb-[20px]`}
        >
          <div className="flex flex-col w-full">
            <div className="text-[30px] font-medium">{cityName}</div>

            <div className="flex flex-row items-center mt-[-10px]">
              <div className="text-gray-700 text-[40px]">
                {isCelsius ? temperature.celsius : temperature.fahrenheit}
              </div>
              <div className="flex items-start ml-[10px] mt-[-5px]">
                <button
                  onClick={() => setIsCelsius(true)}
                  className={`text-[25px] transition-all ${
                    isCelsius ? "text-gray-700 font-medium" : "text-gray-400"
                  }`}
                >
                  °C
                </button>
                <div className="text-gray-400 text-[25px] mx-[4px]">|</div>
                <button
                  onClick={() => setIsCelsius(false)}
                  className={`text-[25px] transition-all ${
                    !isCelsius ? "text-gray-700 font-medium" : "text-gray-400"
                  }`}
                >
                  °F
                </button>
              </div>
            </div>

            <div className="text-gray-500 text-[16px] mt-1 pointer-events-none">
              {weatherDescription}
            </div>
            {weather && (
              <div className="text-gray-700 text-[16px] mt-[0px]">
                Feels like &nbsp;
                {isCelsius
                  ? Math.round(weather.main.feels_like)
                  : Math.round(
                      (Math.round(weather.main.feels_like) * 9) / 5 + 32
                    )}{" "}
                {isCelsius ? "°C" : "°F"}
              </div>
            )}
          </div>

          {getWeatherIcon()}
        </div>

        <div
          className={`flex flex-row justify-between mt-[15px] px-[5px] ${
            error ? "pb-[10px]" : "pb-[30px]"
          } border-b-[1px] border-b-gray-300`}
        >
          <div className="flex flex-col items-start">
            <div className="text-[16px] text-gray-500">Wind Speed</div>
            <Wind className="w-[40px] h-[40px] text-lime-600 mt-1" />
            <div className="text-[20px] font-medium mt-1">{getWindSpeed()}</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-[16px] text-gray-500">Humidity</div>
            <Droplet className="w-[40px] h-[40px] text-lime-600 mt-1" />
            <div className="text-[20px] font-medium mt-1">{getHumidity()}</div>
          </div>

          <div className="flex flex-col items-end">
            <div className="text-[16px] text-gray-500">Rain Chance</div>
            <CloudRain className="w-[40px] h-[40px] text-lime-600 mt-1" />
            <div className="text-[20px] font-medium mt-1">
              {getRainChance()}
            </div>
          </div>
        </div>

        {weather && (
          <div className="mt-[680px] fixed  top-0  ml-[45px] w-[200px] flex flex-col z-20 text-sm text-gray-600">
            <div className="flex justify-between border-b-[1px] pb-[3px] border-b-gray-300">
              <span>Pressure:</span>
              <span className="text-[15px] text-black">
                {weather.main.pressure} hPa
              </span>
            </div>
            <div className="flex justify-between mt-[5px] border-b-[1px] pb-[3px] border-b-gray-300">
              <span>Visibility:</span>
              <span className="text-[15px] text-black">
                {weather.visibility ? `${weather.visibility / 1000} km` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between mt-[5px] border-b-[1px] pb-[3px] border-b-gray-300">
              <span>Sunrise:</span>
              <span className="text-[15px] text-black">
                {WeatherService.formatTimeWithTimezone(
                  weather.sys.sunrise,
                  weather.timezone
                )}
              </span>
            </div>
            <div className="flex justify-between mt-[5px] ">
              <span>Sunset:</span>
              <span className="text-[15px] text-black">
                {WeatherService.formatTimeWithTimezone(
                  weather.sys.sunset,
                  weather.timezone
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimationControls;
