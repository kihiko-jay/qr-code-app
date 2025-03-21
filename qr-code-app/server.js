import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

// Configuration
dotenv.config();
const PORT = process.env.PORT || 5000;

// Import routes
import authRoutes from "./routes/authRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import qrCodeRoutes from "./routes/qrCodeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URLS?.split(",") || [
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    credentials: true
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/campaign", campaignRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/qrCode", qrCodeRoutes);
app.use("/api/admin", adminRoutes);

// Health Check
app.get("/", (req, res) => {
    res.status(200).json({ status: "OK", message: "QR Code App API is Running!" });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Server error:", err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});
//matrias
console.log("Backend API URL:", process.env.PORT);

//matrials 

// Database Connection & Server Start
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
        });
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    }
};

// Start application
connectDB();