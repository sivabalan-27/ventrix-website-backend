
import multer from "multer";
import fs from "fs";
import path from "path";

const uploadPath = path.join("uploads", "resumes");

fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    cb(null, uniqueName);
  },
});

// Allowed file extensions and MIME types
const allowedFiles = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const expectedMimeType = allowedFiles[extension];

  if (!expectedMimeType || file.mimetype !== expectedMimeType) {
    return cb(
      new Error("Only valid PDF, DOC, and DOCX files are allowed.")
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
});

// Handle Multer errors
export const handleResumeUpload = (req, res, next) => {
  upload.single("resume")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: "Resume file size must not exceed 5 MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Resume upload failed. Please check the selected file.",
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  });
};
