
import mongoose from "mongoose";
import Application from "../models/Application.js";

const APPLICATION_STATUSES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
];

const MAX_SEARCH_LENGTH = 100;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

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

// Get applications with search, filtering and pagination
export const getApplications = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      page = "1",
      limit = String(DEFAULT_PAGE_SIZE),
    } = req.query;

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

    if (
      typeof status !== "string" ||
      (status && !APPLICATION_STATUSES.includes(status))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status.",
      });
    }

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

    if (status === "Applied") {
      conditions.push({
        $or: [
          { status: "Applied" },
          { status: { $exists: false } },
          { status: null },
        ],
      });
    } else if (status) {
      conditions.push({ status });
    }

    if (trimmedSearch) {
      const escapedSearch = trimmedSearch.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      conditions.push({
        $or: [
          {
            fullName: {
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
            position: {
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

    const [applications, totalApplications] =
      await Promise.all([
        Application.find(filter)
          .sort({ createdAt: -1, _id: -1 })
          .skip(skip)
          .limit(pageSize)
          .lean(),

        Application.countDocuments(filter),
      ]);

    const formattedApplications = applications.map(
      (application) => ({
        ...application,
        status: application.status || "Applied",
      })
    );

    const totalPages = Math.ceil(
      totalApplications / pageSize
    );

    return res.status(200).json({
      success: true,
      count: formattedApplications.length,
      total: totalApplications,
      pagination: {
        currentPage,
        pageSize,
        totalApplications,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
      applications: formattedApplications,
    });
  } catch (error) {
    console.error(
      "Fetch applications error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch applications.",
    });
  }
};

// Get one application's complete details
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    const application = await Application.findById(id)
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      application: {
        ...application,
        status: application.status || "Applied",
      },
    });
  } catch (error) {
    console.error(
      "Fetch application details error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch application details.",
    });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = req.body?.status;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    if (
      typeof status !== "string" ||
      !APPLICATION_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status.",
      });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { $set: { status } },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully.",
      application: {
        ...application,
        status: application.status || "Applied",
      },
    });
  } catch (error) {
    console.error(
      "Update application status error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update application status.",
    });
  }
};
