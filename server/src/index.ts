import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import weatherRoutes from "./routes/weather";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins for now
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

// Handle preflight requests
app.options("*", cors());

app.use(express.json());
app.use("/api/weather", weatherRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 Weather API endpoint: http://localhost:${PORT}/api/weather`);
});
// Routes
app.use("/api/weather", weatherRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 Weather API endpoint: http://localhost:${PORT}/api/weather`);
});

// Error handling
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);
