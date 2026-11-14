
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    fullName: {
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
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    qualification: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    linkedin: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    portfolio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    resume: {
      filename: {
        type: String,
        required: true,
        maxlength: 255,
      },
      fileId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      mimetype: {
        type: String,
        default: "application/pdf",
      },
      size: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: [
        "Applied",
        "Under Review",
        "Shortlisted",
        "Interview",
        "Selected",
        "Rejected",
      ],
      default: "Applied",
    },
  },
  {
    timestamps: true,
  }
);

const Application =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);

export default Application;
