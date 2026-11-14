
import express from "express";
import adminAuth from "../middleware/adminAuth.js";

import {
  getApplications,
  getApplicationById,
  updateApplicationStatus,
} from "../controllers/adminApplicationController.js";

import {
  getApplicationResume,
} from "../controllers/adminResumeController.js";

const router = express.Router();

// All application management routes require admin authentication
router.use(adminAuth);

// Get all applications with search and filtering
router.get("/", getApplications);

// View or download an applicant's resume
router.get("/:id/resume", getApplicationResume);

// Get individual application details
router.get("/:id", getApplicationById);

// Update application status
router.patch("/:id/status", updateApplicationStatus);

export default router;
