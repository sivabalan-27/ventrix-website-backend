import rateLimit from "express-rate-limit";

const chatLimiter = rateLimit({
  windowMs: 120 * 1000, // 2 minutes
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many messages. Please wait 2 minutes before trying again.",
  },
});

export default chatLimiter;