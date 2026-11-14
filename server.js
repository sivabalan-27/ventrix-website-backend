
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";

import connectDB from "./config/db.js";

// Public routes
import contactRoutes from "./routes/contactRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

// Admin routes
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminApplicationRoutes from "./routes/adminApplicationRoutes.js";
import adminEnquiryRoutes from "./routes/adminEnquiryRoutes.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

// Validate environment configuration
const validateEnvironment = () => {
  const requiredVariables = [
    "MONGODB_URI",
    "JWT_SECRET",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD_HASH",
  ];

  if (isProduction) {
    requiredVariables.push("CLIENT_URL", "ADMIN_URL");
  }

  const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable]?.trim()
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing environment variables: ${missingVariables.join(", ")}`
    );
  }

  if (
    process.env.JWT_SECRET &&
    process.env.JWT_SECRET.length < 32
  ) {
    throw new Error("JWT_SECRET must contain at least 32 characters.");
  }

  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error("Invalid server port configuration.");
  }
};

// Validate configuration before starting
validateEnvironment();

// Prevent Express technology disclosure
app.disable("x-powered-by");

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = new Set([
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean));

if (!isProduction) {
  allowedOrigins.add("http://localhost:5173");
  allowedOrigins.add("http://localhost:5174");
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      const error = new Error("Origin not allowed by CORS");
      error.status = 403;

      return callback(error);
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    optionsSuccessStatus: 204,
  })
);

// General middleware
app.use(express.json({ limit: "10kb" }));

app.use(
  express.urlencoded({
    extended: false,
    limit: "10kb",
  })
);

// Request logging
app.use(morgan(isProduction ? "combined" : "dev"));

// Admin authentication routes
app.use("/api/admin/auth", adminAuthRoutes);

// Protected admin routes
app.use("/api/admin/applications", adminApplicationRoutes);
app.use("/api/admin/enquiries", adminEnquiryRoutes);
app.use("/api/admin", adminRoutes);

// Public website APIs
app.use("/api/contact", contactRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/chat", chatRoutes);

// Health check
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Ventrix Technologies API is running",
    environment: NODE_ENV,
  });
});

// 404 handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Requested API endpoint not found.",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error(
    "Server Error:",
    error.message || "Unknown error"
  );

  // Invalid JSON
  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    "body" in error
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  // Request payload too large
  if (
    error.status === 413 ||
    error.type === "entity.too.large"
  ) {
    return res.status(413).json({
      success: false,
      message: "Request payload is too large.",
    });
  }

  // CORS rejection
  if (error.status === 403) {
    return res.status(403).json({
      success: false,
      message: "Request origin is not allowed.",
    });
  }

  // Other client errors
  if (
    Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status < 500
  ) {
    return res.status(error.status).json({
      success: false,
      message: "Invalid request.",
    });
  }

  // Internal server errors
  return res.status(500).json({
    success: false,
    message: "Internal server error. Please try again later.",
  });
});

// Start server
const startServer = async () => {
  let server;
  let isShuttingDown = false;

  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log("--------------------------------");
      console.log("Ventrix Technologies API");
      console.log(`Environment: ${NODE_ENV}`);
      console.log(`Server running on port ${PORT}`);
      console.log("MongoDB connected successfully");
      console.log("--------------------------------");
    });

    server.on("error", (error) => {
      console.error("HTTP server error:", error.message);
      process.exit(1);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      if (isShuttingDown) return;

      isShuttingDown = true;

      console.log(
        `${signal} received. Shutting down server...`
      );

      const forceShutdown = setTimeout(() => {
        console.error("Forced shutdown.");
        process.exit(1);
      }, 10000);

      forceShutdown.unref();

      server.close(async (error) => {
        if (error) {
          console.error(
            "HTTP server shutdown error:",
            error.message
          );

          process.exit(1);
        }

        try {
          await mongoose.disconnect();

          console.log("HTTP server closed.");
          console.log("MongoDB disconnected.");

          clearTimeout(forceShutdown);
          process.exit(0);
        } catch (disconnectError) {
          console.error(
            "MongoDB shutdown error:",
            disconnectError.message
          );

          process.exit(1);
        }
      });
    };

    process.once("SIGTERM", () => shutdown("SIGTERM"));
    process.once("SIGINT", () => shutdown("SIGINT"));

  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();
