
import Application from "../models/Application.js";
import fs from "fs/promises";

export const createApplication = async (req, res, next) => {
  try {
    const {
      position,
      fullName,
      email,
      phone,
      location,
      qualification,
      linkedin,
      portfolio,
      message,
    } = req.body;

    // Validate required fields
    const requiredFields = {
      position,
      fullName,
      email,
      phone,
      location,
      qualification,
      message,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value || !String(value).trim())
      .map(([field]) => field);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
        errors: missingFields,
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Validate resume
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume.",
      });
    }

    // Save application
    const application = await Application.create({
      position: position.trim(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      location: location.trim(),
      qualification: qualification.trim(),
      linkedin: linkedin?.trim() || "",
      portfolio: portfolio?.trim() || "",
      message: message.trim(),
      resume: {
        filename: req.file.filename,
        path: req.file.path,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Your application has been submitted successfully.",
      data: application,
    });
  } catch (error) {
    console.error("Application submission error:", error);

    // Delete uploaded resume if application saving fails
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (fileError) {
        console.error("Resume cleanup failed:", fileError.message);
      }
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Please check the application details.",
      });
    }

    // Duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This application already exists.",
      });
    }

    // Pass unexpected errors to global error handler
    return next(error);
  }
};
