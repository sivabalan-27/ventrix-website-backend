
import Application from "../models/Application.js";
import ResumeFile from "../models/ResumeFile.js";
import path from "path";

// Maximum allowed character lengths
const maxLengths = {
  position: 100,
  fullName: 100,
  email: 254,
  phone: 20,
  location: 100,
  qualification: 150,
  linkedin: 500,
  portfolio: 500,
  message: 2000,
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate optional URLs
const isValidUrl = (value) => {
  try {
    const url = new URL(value);

    return (
      ["http:", "https:"].includes(url.protocol) &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
};

// Validate application fields
const validateApplication = (body) => {
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
  } = body || {};

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
    .filter(
      ([, value]) =>
        typeof value !== "string" || !value.trim()
    )
    .map(([field]) => field);

  if (missingFields.length > 0) {
    return {
      valid: false,
      message: "Please fill in all required fields.",
      errors: missingFields,
    };
  }

  const fields = {
    position: position.trim(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    location: location.trim(),
    qualification: qualification.trim(),
    linkedin:
      typeof linkedin === "string" ? linkedin.trim() : "",
    portfolio:
      typeof portfolio === "string" ? portfolio.trim() : "",
    message: message.trim(),
  };

  const exceededFields = Object.entries(maxLengths)
    .filter(([field, max]) => fields[field].length > max)
    .map(([field]) => field);

  if (exceededFields.length > 0) {
    return {
      valid: false,
      message: "One or more fields exceed the allowed character limit.",
      errors: exceededFields,
    };
  }

  if (!emailRegex.test(fields.email)) {
    return {
      valid: false,
      message: "Please enter a valid email address.",
    };
  }

  for (const field of ["linkedin", "portfolio"]) {
    if (fields[field] && !isValidUrl(fields[field])) {
      return {
        valid: false,
        message: `Please enter a valid ${field} URL.`,
      };
    }
  }

  return {
    valid: true,
    fields,
  };
};

export const createApplication = async (req, res, next) => {
  let savedResume = null;

  try {
    // Resume is required
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume.",
      });
    }

    // This assessment currently accepts PDF resumes only
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        message: "Only PDF resumes are accepted.",
      });
    }

    const validation = validateApplication(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        ...(validation.errors && {
          errors: validation.errors,
        }),
      });
    }

    // Save resume binary data in MongoDB
    savedResume = await ResumeFile.create({
      filename: path.basename(req.file.originalname),
      contentType: "application/pdf",
      size: req.file.size,
      data: req.file.buffer,
    });

    // Save application with its resume reference
    await Application.create({
      ...validation.fields,
      resume: {
        filename: savedResume.filename,
        fileId: savedResume._id,
        mimetype: savedResume.contentType,
        size: savedResume.size,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Your application has been submitted successfully.",
    });
  } catch (error) {
    console.error(
      "Application submission error:",
      error.message
    );

    // Remove orphaned resume if application creation fails
    if (savedResume?._id) {
      try {
        await ResumeFile.findByIdAndDelete(savedResume._id);
      } catch (cleanupError) {
        console.error(
          "Resume cleanup failed:",
          cleanupError.message
        );
      }
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Please check the application details.",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This application already exists.",
      });
    }

    return next(error);
  }
};
