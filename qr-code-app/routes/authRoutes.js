import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect, adminOnly,authenticateUser } from "../middleware/authMiddleware.js";
import dotenv from "dotenv";


dotenv.config();

const router = express.Router();


if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET is missing in .env");
  process.exit(1);
}

// ✅ Register New User
router.post("/register", async (req, res) => {
  console.log("Incoming Request Body:", req.body);
  try {
    let { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    email = email.toLowerCase().trim();
    username = username.trim();

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email
          ? "Email already registered"
          : "Username already exists"
      });
    }

    if (role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin already exists" });
      }
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
console.log(hashedPassword);
console.log(password)
    const user = new User({
      username,
      email,
      password,
      role: role || "user",
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully",email,password });
    //matriasl
    const isMatch = await bcrypt.compare(password, user.password);

console.log("🔍 Entered Password:", password,"hapa basi");
console.log("🔐 Hashed Password from DB:", user.password,"hukuu");
console.log("✅ Password Match:", isMatch,"kubali tu");

if (!isMatch) {
  return res.status(401).json({ message: "Incorrect password" });
}
    //matrials tu

  } catch (err) {
    console.error("❌ Registration Error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: `${Object.keys(err.keyValue)[0]} already exists`,
      });
    }

    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

// ✅ Login User
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    console.log("login attempt:", email)

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    email = email.toLowerCase().trim();
    const user = await User.findOne({ email });
    console.log("Found User:", user,"ngori san agathee");  // Debugging
    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({ message: "Invalid credentials" });
    }
      // Check password match
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log("Password Match:", passwordMatch); // DEBUG
  
      if (!passwordMatch) {
        console.log("❌ Incorrect password");
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log("Found User:", user);  // Debugging
      return res.status(401).json({ message: "upusi tupu" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Authentication failed" });
  }
});

// ✅ Fetch Current User (Protected Route)
router.get("/me", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
