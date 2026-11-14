
import express from "express";
import { adminLogin } from "../controllers/adminAuthController.js";
import adminLoginLimiter from "../middleware/adminLoginLimiter.js";

const router = express.Router();

router.post("/login", adminLoginLimiter, adminLogin);

export default router;
