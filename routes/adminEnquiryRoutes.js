
import express from "express";
import adminAuth from "../middleware/adminAuth.js";

import {
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
} from "../controllers/adminEnquiryController.js";

import {
  reclassifyMissingEnquiries,
} from "../controllers/adminEnquiryClassificationController.js";

const router = express.Router();

// Protect all enquiry routes
router.use(adminAuth);

// Reclassify enquiries missing AI classification
router.post("/reclassify", reclassifyMissingEnquiries);

// Get all enquiries
router.get("/", getEnquiries);

// Get individual enquiry
router.get("/:id", getEnquiryById);

// Update enquiry status
router.patch("/:id/status", updateEnquiryStatus);

export default router;
