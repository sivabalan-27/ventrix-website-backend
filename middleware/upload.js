
import multer from "multer";
import path from "path";

// Allow PDF files only
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    extension !== ".pdf" ||
    file.mimetype !== "application/pdf"
  ) {
    return cb(new Error("Invalid resume file type."));
  }

  cb(null, true);
};

// Configure Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 20,
    parts: 21,
  },
});

// Validate actual PDF file signature
const validateFileSignature = (file) => {
  const buffer = file.buffer;

  if (!buffer || buffer.length < 8) {
    return false;
  }

  return buffer.subarray(0, 5).toString() === "%PDF-";
};

// Handle resume upload and validation
export const handleResumeUpload = (req, res, next) => {
  upload.single("resume")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      const isFileTooLarge = error.code === "LIMIT_FILE_SIZE";

      return res.status(isFileTooLarge ? 413 : 400).json({
        success: false,
        message: isFileTooLarge
          ? "Resume file size must not exceed 5 MB."
          : "Resume upload failed. Please check the selected file.",
      });
    }

    if (error) {
      console.error("Resume upload error:", error.message);

      return res.status(400).json({
        success: false,
        message: "Invalid resume upload. Please select a valid PDF file.",
      });
    }

    // Application controller checks whether resume is required
    if (!req.file) {
      return next();
    }

    const isValid = validateFileSignature(req.file);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "The uploaded file is not a valid PDF.",
      });
    }

    return next();
  });
};
