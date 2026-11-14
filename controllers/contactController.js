
import Contact from "../models/Contact.js";
import classifyLeadEnquiry from "../services/leadClassificationService.js";

const allowedCategories = [
  "Web Development",
  "Mobile App Development",
  "AI & Automation",
  "Digital Marketing",
  "IT Consulting",
  "General Enquiry",
];

const allowedPriorities = ["High", "Medium", "Low"];

const allowedServices = [
  "Web Development",
  "Mobile Application Development",
  "AI & Automation Solutions",
  "Software Development",
  "Digital Marketing",
  "IT Consulting",
  "General Enquiry",
];

const maxLengths = {
  name: 100,
  email: 254,
  subject: 150,
  message: 2000,
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateContactFields = (body) => {
  const { name, email, subject, message } = body || {};

  const requiredFields = {
    name,
    email,
    subject,
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
      status: 400,
      message: "All fields are required.",
      errors: missingFields,
    };
  }

  const fields = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
  };

  const exceededFields = Object.entries(maxLengths)
    .filter(([field, max]) => fields[field].length > max)
    .map(([field]) => field);

  if (exceededFields.length > 0) {
    return {
      valid: false,
      status: 400,
      message: "One or more fields exceed the allowed character limit.",
      errors: exceededFields,
    };
  }

  if (!emailRegex.test(fields.email)) {
    return {
      valid: false,
      status: 400,
      message: "Please enter a valid email address.",
    };
  }

  return {
    valid: true,
    fields,
  };
};

const validateClassification = (classification) => {
  return (
    classification &&
    allowedCategories.includes(classification.category) &&
    allowedPriorities.includes(classification.priority) &&
    allowedServices.includes(classification.recommendedService) &&
    typeof classification.summary === "string" &&
    classification.summary.trim().length > 0 &&
    classification.summary.trim().length <= 300
  );
};

export const createContact = async (req, res, next) => {
  try {
    // Validate and normalize submitted fields
    const validation = validateContactFields(req.body);

    if (!validation.valid) {
      return res.status(validation.status).json({
        success: false,
        message: validation.message,
        ...(validation.errors && { errors: validation.errors }),
      });
    }

    const fields = validation.fields;

    // Save the contact before calling AI
    const newContact = await Contact.create(fields);

    // Perform AI-assisted lead classification
    try {
      const classification = await classifyLeadEnquiry({
        subject: fields.subject,
        message: fields.message,
      });

      if (!validateClassification(classification)) {
        throw new Error("Gemini returned an invalid classification.");
      }

      // Save validated classification in MongoDB
      newContact.aiClassification = {
        category: classification.category,
        priority: classification.priority,
        summary: classification.summary.trim(),
        recommendedService: classification.recommendedService,
      };

      await newContact.save();

      console.log("AI lead classification saved successfully.");
    } catch (classificationError) {
      // Do not fail contact submission if AI classification fails
      console.error(
        "AI lead classification failed:",
        classificationError.message
      );
    }

    // Return only public-safe information
    return res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully.",
    });
  } catch (error) {
    console.error("Contact submission error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Please check the submitted contact details.",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This contact submission already exists.",
      });
    }

    return next(error);
  }
};
