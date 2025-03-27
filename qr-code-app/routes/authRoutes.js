import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect, adminOnly, authenticateUser } from "../middleware/authMiddleware.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Validate environment configuration
if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET is missing in .env");
  process.exit(1);
}

// Utility function for generating tokens
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", async (req, res) => {
  try {
    let { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: "All fields are required",
        code: "MISSING_FIELDS"
      });
    }

    // Normalize and trim inputs
    email = email.toLowerCase().trim();
    username = username.trim();
    role = role?.trim().toLowerCase() || "user";

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email
          ? "Email already registered"
          : "Username already exists",
        code: "USER_EXISTS"
      });
    }

    // Special handling for admin registration
    if (role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return res.status(400).json({ 
          message: "Admin already exists",
          code: "ADMIN_EXISTS"
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    await user.save();

    // Generate token for immediate login
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      code: "REGISTRATION_SUCCESS"
    });

  } catch (err) {
    console.error("Registration Error:", err);

    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({
        message: `${Object.keys(err.keyValue)[0]} already exists`,
        code: "DUPLICATE_KEY"
      });
    }

    res.status(500).json({ 
      message: "Registration failed. Please try again.",
      code: "SERVER_ERROR"
    });
  }
});

// @desc    Authenticate user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required",
        code: "MISSING_CREDENTIALS"
      });
    }

    // Normalize email
    email = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS"
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS"
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      code: "LOGIN_SUCCESS"
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ 
      message: "Authentication failed",
      code: "AUTH_ERROR"
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get("/me", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ 
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ 
      message: "Server error",
      code: "SERVER_ERROR"
    });
  }
});

// @desc    Logout user (client-side token invalidation)
// @route   POST /api/auth/logout
// @access  Private
router.post("/logout", authenticateUser, (req, res) => {
  res.json({ 
    message: "Logout successful. Please remove your token client-side.",
    code: "LOGOUT_SUCCESS"
  });
});

export default router;