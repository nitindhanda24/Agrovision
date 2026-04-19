const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { getRequiredEnv } = require("./config/env");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.set("trust proxy", 1);

const clientUrl = getRequiredEnv("CLIENT_URL", "http://localhost:3000");
const allowedOrigins = Array.from(new Set([
  ...clientUrl.split(",").map((origin) => origin.trim()).filter(Boolean),
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173"
]));
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(apiLimiter);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "AgroVision API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "AgroVision API is healthy"
  });
});

app.use("/api/auth", authLimiter);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/crop-requests", require("./routes/cropRequestRoutes"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong"
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
