
import mongoose from "mongoose";
import Contact from "../models/Contact.js";

const ENQUIRY_STATUSES = [
  "New",
  "Contacted",
  "In Discussion",
  "Converted",
  "Closed",
];

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const MAX_SEARCH_LENGTH = 100;

// Validate positive integer query parameters
const parsePositiveInteger = (value, defaultValue) => {
  if (value === undefined || value === "") {
    return defaultValue;
  }

  if (
    typeof value !== "string" ||
    !/^\d+$/.test(value)
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isSafeInteger(parsed) && parsed > 0
    ? parsed
    : null;
};

// Validate MongoDB ObjectId
const isValidId = (id) => {
  return (
    typeof id === "string" &&
    /^[a-f\d]{24}$/i.test(id) &&
    mongoose.isValidObjectId(id)
  );
};

// Get enquiries with search, status filtering and pagination
export const getEnquiries = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      page = "1",
      limit = String(DEFAULT_PAGE_SIZE),
    } = req.query;

    // Validate pagination
    const currentPage = parsePositiveInteger(page, 1);
    const pageSize = parsePositiveInteger(
      limit,
      DEFAULT_PAGE_SIZE
    );

    if (
      currentPage === null ||
      pageSize === null ||
      pageSize > MAX_PAGE_SIZE
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters.",
      });
    }

    const skip = (currentPage - 1) * pageSize;

    if (!Number.isSafeInteger(skip)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters.",
      });
    }

    // Validate status
    if (
      typeof status !== "string" ||
      (status && !ENQUIRY_STATUSES.includes(status))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry status.",
      });
    }

    // Validate search
    if (
      typeof search !== "string" ||
      search.trim().length > MAX_SEARCH_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid search parameter.",
      });
    }

    const trimmedSearch = search.trim();
    const conditions = [];

    // Apply status filter
    if (status === "New") {
      conditions.push({
        $or: [
          { status: "New" },
          { status: { $exists: false } },
          { status: null },
        ],
      });
    } else if (status) {
      conditions.push({ status });
    }

    // Apply search filter
    if (trimmedSearch) {
      const escapedSearch = trimmedSearch.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      conditions.push({
        $or: [
          {
            name: {
              $regex: escapedSearch,
              $options: "i",
            },
          },
          {
            email: {
              $regex: escapedSearch,
              $options: "i",
            },
          },
          {
            subject: {
              $regex: escapedSearch,
              $options: "i",
            },
          },
        ],
      });
    }

    const filter =
      conditions.length > 0
        ? { $and: conditions }
        : {};

    // Fetch enquiries and total count simultaneously
    const [enquiries, totalEnquiries] = await Promise.all([
      Contact.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),

      Contact.countDocuments(filter),
    ]);

    const formattedEnquiries = enquiries.map((enquiry) => ({
      ...enquiry,
      status: enquiry.status || "New",
    }));

    const totalPages = Math.ceil(
      totalEnquiries / pageSize
    );

    return res.status(200).json({
      success: true,
      count: formattedEnquiries.length,
      total: totalEnquiries,

      pagination: {
        currentPage,
        pageSize,
        totalEnquiries,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },

      enquiries: formattedEnquiries,
    });
  } catch (error) {
    console.error(
      "Fetch enquiries error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch enquiries.",
    });
  }
};

// Get individual enquiry details
export const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry ID.",
      });
    }

    const enquiry = await Contact.findById(id).lean();

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      enquiry: {
        ...enquiry,
        status: enquiry.status || "New",
      },
    });
  } catch (error) {
    console.error(
      "Fetch enquiry details error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch enquiry details.",
    });
  }
};

// Update enquiry status
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = req.body?.status;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry ID.",
      });
    }

    if (
      typeof status !== "string" ||
      !ENQUIRY_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry status.",
      });
    }

    const enquiry = await Contact.findByIdAndUpdate(
      id,
      { $set: { status } },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enquiry status updated successfully.",
      enquiry,
    });
  } catch (error) {
    console.error(
      "Update enquiry status error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update enquiry status.",
    });
  }
};
