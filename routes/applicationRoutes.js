
import express from "express";
import { handleResumeUpload } from "../middleware/upload.js";
import { createApplication } from "../controllers/applicationController.js";

const router = express.Router();

router.post("/", handleResumeUpload, createApplication);

export default router;
