import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

// Get current weather by city name
router.get("/current/:city", async (req, res) => {
  try {
    const { city } = req.params;
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        q: city,
        appid: OPENWEATHER_API_KEY,
        units: "metric", // Use 'imperial' for Fahrenheit
        lang: "en",
      },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("Weather API error:", error.response?.data || error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({ error: "City not found" });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// Get weather by coordinates
router.get("/current/coordinates", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY,
        units: "metric",
        lang: "en",
      },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("Weather API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// Get 5-day forecast
router.get("/forecast/:city", async (req, res) => {
  try {
    const { city } = req.params;
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/forecast`, {
      params: {
        q: city,
        appid: OPENWEATHER_API_KEY,
        units: "metric",
        cnt: 5, // 5 days
      },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("Forecast API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch forecast" });
  }
});

// Get weather by ZIP code (optional)
router.get("/current/zip/:zip/:country?", async (req, res) => {
  try {
    const { zip, country = "us" } = req.params;
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        zip: `${zip},${country}`,
        appid: OPENWEATHER_API_KEY,
        units: "metric",
      },
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("Weather API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

export default router;
