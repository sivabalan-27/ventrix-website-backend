import express from "express";
import { chatWithGemini } from "../controllers/chatController.js";
import chatLimiter from "../middleware/chatLimiter.js";

const router = express.Router();

router.post("/", chatLimiter, chatWithGemini);

export default router;
