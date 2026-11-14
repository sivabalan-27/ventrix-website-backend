
import mongoose from "mongoose";

const resumeFileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      maxlength: 255,
    },
    contentType: {
      type: String,
      required: true,
      enum: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    },
    size: {
      type: Number,
      required: true,
      max: 5 * 1024 * 1024,
    },
    data: {
      type: Buffer,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ResumeFile =
  mongoose.models.ResumeFile ||
  mongoose.model("ResumeFile", resumeFileSchema);

export default ResumeFile;
