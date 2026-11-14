
import mongoose from "mongoose";

const aiClassificationSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        "Web Development",
        "Mobile App Development",
        "AI & Automation",
        "Digital Marketing",
        "IT Consulting",
        "General Enquiry",
      ],
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    recommendedService: {
      type: String,
      enum: [
        "Web Development",
        "Mobile Application Development",
        "AI & Automation Solutions",
        "Software Development",
        "Digital Marketing",
        "IT Consulting",
        "General Enquiry",
      ],
    },
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    aiClassification: {
      type: aiClassificationSchema,
      default: undefined,
    },
    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "In Discussion",
        "Converted",
        "Closed",
      ],
      default: "New",
    },
  },
  {
    timestamps: true,
  }
);

const Contact =
  mongoose.models.Contact ||
  mongoose.model("Contact", contactSchema);

export default Contact;
