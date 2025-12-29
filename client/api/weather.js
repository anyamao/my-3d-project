const axios = require("axios");

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: "City parameter is required" });
  }

  try {
    const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: city,
          appid: OPENWEATHER_API_KEY,
          units: "metric",
          lang: "en",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Weather API error:", error.response?.data || error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({ error: "City not found" });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    res.status(500).json({ error: "Failed to fetch weather data" });
  }
};
