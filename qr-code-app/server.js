import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { createServer } from 'node:https'; // Correct way to import https
import { readFileSync } from 'node:fs'; // Correct way to import fs

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 5000;

// Configure allowed origins
const allowedOrigins = [
  process.env.CLIENT_URLS, 
  "http://localhost:5173",
  "https://*.app.github.dev", // Wildcard for all GitHub Codespaces
  "https://*.github.dev" // Additional GitHub domain
].filter(Boolean);

console.log("🌍 Allowed Origins:", allowedOrigins);

// Create Express app
const app = express();

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// =====================
// SECURITY MIDDLEWARE
// =====================
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// =====================
// CORS CONFIGURATION
// =====================
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all GitHub Codespaces origins
    if (origin && (origin.includes('.app.github.dev') || origin.includes('.github.dev'))) {
      return callback(null, true);
    }
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚨 CORS Blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  maxAge: 86400
};

// Use only ONE CORS middleware
app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log('Incoming Headers:', req.headers);
  console.log('Request Origin:', req.get('origin'));
  next();
});

// =====================
// ROUTES
// =====================
import authRoutes from "./routes/authRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import qrCodeRoutes from "./routes/qrCodeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/campaign", campaignRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/qrCode", qrCodeRoutes);
app.use("/api/admin", adminRoutes);

// =====================
// HEALTH CHECK
// =====================
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "QR Code Generator API",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// =====================
// ERROR HANDLING
// =====================
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);
  
  const statusCode = err.message.includes("CORS") ? 403 : 500;
  const response = {
    error: statusCode === 403 ? "Forbidden" : "Internal Server Error",
    message: err.message
  };
  
  if (process.env.NODE_ENV === "production") {
    delete response.stack;
  } else {
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
});

// =====================
// DATABASE CONNECTION
// =====================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      retryWrites: true,
      w: "majority"
    });
    
    console.log("✅ MongoDB Connected");

    // HTTPS configuration (only if not in GitHub Codespaces)
    if (process.env.NODE_ENV !== 'development' && !process.env.CODESPACES) {
      const sslOptions = {
        key: readFileSync('key.pem'),
        cert: readFileSync('cert.pem')
      };
      createServer(sslOptions, app).listen(PORT, () => {
        console.log(`🚀 Secure server running on port ${PORT}`);
      });
    } else {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    }
    
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

connectDB();