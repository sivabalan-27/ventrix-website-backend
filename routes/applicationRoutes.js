
import express from "express";
import { handleResumeUpload } from "../middleware/upload.js";
import { createApplication } from "../controllers/applicationController.js";
import applicationLimiter from "../middleware/applicationLimiter.js";

const router = express.Router();

router.post(
  "/",
  applicationLimiter,
  handleResumeUpload,
  createApplication
);

export default router;
