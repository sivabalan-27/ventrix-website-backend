
import mongoose from "mongoose";

import Application from "../models/Application.js";
import ResumeFile from "../models/ResumeFile.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const sanitizeFilename = (filename) => {
  const safeFilename = String(filename || "resume")
    .replace(/[/\\]/g, "_")
    .replace(/[\r\n"]/g, "_")
    .replace(/[^\w.\- ()]/g, "_")
    .slice(0, 200);

  return safeFilename || "resume.pdf";
};

const isValidPdf = (buffer) => {
  return (
    Buffer.isBuffer(buffer) &&
    buffer.length >= 8 &&
    buffer.subarray(0, 5).toString() === "%PDF-"
  );
};

export const getApplicationResume = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate application ID
    if (
      typeof id !== "string" ||
      !/^[a-f\d]{24}$/i.test(id) ||
      !mongoose.isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    // Retrieve application and resume reference
    const application = await Application.findById(id)
      .select("resume.filename resume.fileId resume.mimetype resume.size")
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    const resume = application.resume;

    if (
      !resume?.fileId ||
      !mongoose.isValidObjectId(resume.fileId)
    ) {
      return res.status(404).json({
        success: false,
        message: "Resume not found for this application.",
      });
    }

    // Retrieve resume document from MongoDB.
    // Do not use lean() here; let Mongoose hydrate the Buffer field.
    const resumeFile = await ResumeFile.findById(resume.fileId);

    if (!resumeFile) {
      return res.status(404).json({
        success: false,
        message: "Resume file not found.",
      });
    }

    // Validate filename and content type
    const filename = sanitizeFilename(resume.filename);

    if (
      !filename.toLowerCase().endsWith(".pdf") ||
      resumeFile.contentType !== "application/pdf" ||
      resume.mimetype !== "application/pdf"
    ) {
      return res.status(400).json({
        success: false,
        message: "Unsupported or invalid resume file type.",
      });
    }

    // Convert stored binary data to a Node.js Buffer if necessary
    const data = Buffer.isBuffer(resumeFile.data)
      ? resumeFile.data
      : Buffer.from(resumeFile.data?.buffer || []);

    if (!isValidPdf(data)) {
      return res.status(400).json({
        success: false,
        message: "Resume file content is invalid.",
      });
    }

    // Verify file size
    if (
      resumeFile.size !== data.length ||
      data.length > MAX_FILE_SIZE ||
      resume.size !== data.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume file size.",
      });
    }

    // Preview or download
    const disposition =
      req.query.download === "true" ? "attachment" : "inline";

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );

    res.setHeader("Content-Length", data.length);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Pragma", "no-cache");

    return res.send(data);
  } catch (error) {
    console.error(
      "Resume retrieval error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the resume.",
    });
  }
};
