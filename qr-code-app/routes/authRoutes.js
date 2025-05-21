import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
dotenv.config();

// Rate limiting middleware
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: "Too many requests from this IP, please try again later.",
    code: "TOO_MANY_REQUESTS"
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

const router = express.Router();
router.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: "CORS test successful",
    origin: req.get('origin'),
    headers: req.headers 
  });
});
// Validate environment configuration
const requiredEnvVars = ['JWT_SECRET', 'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ ERROR: ${envVar} is missing in .env`);
    process.exit(1);
  }
}

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate token
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate email verification token
const generateEmailToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// @route   POST /api/auth/register
// @access  Public
router.post('/register', authLimiter, async (req, res) => {
  try {
    let { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: "All fields are required",
        code: "MISSING_FIELDS"
      });
    }

    // Normalize inputs
    email = email.toLowerCase().trim();
    username = username.trim();
    role = role?.trim().toLowerCase() || 'user';

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        code: "INVALID_EMAIL"
      });
    }

    // Check password strength
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
        code: "WEAK_PASSWORD"
      });
    }

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

    // Create user
    const user = new User({
      username,
      email,
      password,
      role,
      emailVerificationToken: generateEmailToken(),
      emailVerified: false
    });

    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${user.emailVerificationToken}`;
    
    await transporter.sendMail({
      from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verify Your Email Address',
      html: `
        <p>Please click the following link to verify your email:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>If you didn't create an account, please ignore this email.</p>
      `
    });

    // Generate auth token
    const token = generateToken(user._id, user.role);

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
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

// Add other routes (login, logout, me, verifyEmail, etc.) here...
// For your auth routes when setting cookies

export default router;