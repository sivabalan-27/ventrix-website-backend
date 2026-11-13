
import Contact from "../models/Contact.js";

export const createContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    const requiredFields = {
      name,
      email,
      subject,
      message,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value || !String(value).trim())
      .map(([field]) => field);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
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

    // Save contact message
    const newContact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully.",
      data: newContact,
    });
  } catch (error) {
    console.error("Contact submission error:", error);

    // Mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Please check the submitted contact details.",
      });
    }

    // Duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This contact submission already exists.",
      });
    }

    // Pass unexpected errors to global error handler
    return next(error);
  }
};
