
import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import { getDashboardStats } from "../controllers/adminDashboardController.js";

const router = express.Router();

// Verify admin authentication
router.get("/verify", adminAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin authentication verified.",
    admin: req.admin,
  });
});

// Dashboard statistics
router.get("/dashboard/stats", adminAuth, getDashboardStats);

export default router;
