import express from "express";
import User from "../models/User.js";
import QrCode from "../models/QrCode.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Get all users (Admin only)
router.get("/users", protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

// 🔹 Delete a user (Admin only)
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete user" });
    }
});

// 🔹 Promote user to admin (Admin only)
router.put("/users/:id/promote", protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.role = "admin";
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to promote user" });
    }
});






// 🔹 Get all QR codes (Admin only)
router.get("/qrcodes", protect, adminOnly, async (req, res) => {
    try {
        const qrCodes = await QrCode.find().populate("createdBy", "username email");
        res.json(qrCodes);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch QR codes" });
    }
});

// 🔹 Delete a QR code (Admin only)
router.delete("/qrcodes/:id", protect, adminOnly, async (req, res) => {
    try {
        await QrCode.findByIdAndDelete(req.params.id);
        res.json({ message: "QR Code deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete QR code" });
    }
});



export default router;
