
import Application from "../models/Application.js";
import Contact from "../models/Contact.js";

// Generate the last six months using Asia/Kolkata timezone.
const getLastSixMonths = () => {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  });

  const parts = formatter.formatToParts(now);

  const year = Number(
    parts.find((part) => part.type === "year").value
  );

  const month = Number(
    parts.find((part) => part.type === "month").value
  );

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      Date.UTC(year, month - 1 - 5 + index, 1)
    );

    const monthNumber = date.getUTCMonth() + 1;
    const yearNumber = date.getUTCFullYear();

    return {
      key: `${yearNumber}-${String(monthNumber).padStart(2, "0")}`,
      month: date.toLocaleString("en-IN", {
        month: "short",
        timeZone: "UTC",
      }),
    };
  });
};

export const getDashboardStats = async (req, res) => {
  try {
    const months = getLastSixMonths();

    const [year, month] = months[0].key.split("-").map(Number);

    // Start of the first month in Asia/Kolkata timezone.
    const startDate = new Date(
      Date.UTC(year, month - 1, 1) - 330 * 60 * 1000
    );

    const [
      totalApplications,
      newApplications,
      totalEnquiries,
      newEnquiries,
      recentApplications,
      recentEnquiries,
      applicationStatuses,
      enquiryPriorities,
      applicationTrends,
      enquiryTrends,
    ] = await Promise.all([
      Application.countDocuments(),

      Application.countDocuments({
        $or: [
          { status: "Applied" },
          { status: { $exists: false } },
          { status: null },
        ],
      }),

      Contact.countDocuments(),

      Contact.countDocuments({
        $or: [
          { status: "New" },
          { status: { $exists: false } },
          { status: null },
        ],
      }),

      Application.find()
        .select("fullName position status createdAt")
        .sort({ createdAt: -1, _id: -1 })
        .limit(5)
        .lean(),

      Contact.find()
        .select("name subject status aiClassification createdAt")
        .sort({ createdAt: -1, _id: -1 })
        .limit(5)
        .lean(),

      // Application status distribution
      Application.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$status", "Applied"] },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            count: 1,
          },
        },
      ]),

      // Enquiry priority distribution
      Contact.aggregate([
        {
          $group: {
            _id: {
              $ifNull: [
                "$aiClassification.priority",
                "Unclassified",
              ],
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            priority: "$_id",
            count: 1,
          },
        },
      ]),

      // Monthly application trends
      Application.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
                timezone: "Asia/Kolkata",
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),

      // Monthly enquiry trends
      Contact.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$createdAt",
                timezone: "Asia/Kolkata",
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Convert aggregation results into lookup maps.
    const applicationTrendMap = new Map(
      applicationTrends.map((item) => [item._id, item.count])
    );

    const enquiryTrendMap = new Map(
      enquiryTrends.map((item) => [item._id, item.count])
    );

    // Combine monthly application and enquiry counts.
    const monthlyTrends = months.map((item) => ({
      month: item.month,
      applications: applicationTrendMap.get(item.key) || 0,
      enquiries: enquiryTrendMap.get(item.key) || 0,
    }));

    // Combine recent applications and enquiries.
    const recentActivity = [
      ...recentApplications.map((application) => ({
        id: application._id,
        type: "application",
        name: application.fullName,
        description: `Applied for ${application.position}`,
        status: application.status || "Applied",
        createdAt: application.createdAt,
      })),

      ...recentEnquiries.map((enquiry) => ({
        id: enquiry._id,
        type: "enquiry",
        name: enquiry.name,
        description: enquiry.subject,
        status: enquiry.status || "New",
        aiClassification: enquiry.aiClassification,
        createdAt: enquiry.createdAt,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
      )
      .slice(0, 5);

    return res.status(200).json({
      success: true,

      stats: {
        totalApplications,
        newApplications,
        totalEnquiries,
        newEnquiries,
      },

      analytics: {
        applicationStatuses,
        enquiryPriorities,
        monthlyTrends,
      },

      recentActivity,
    });
  } catch (error) {
    console.error(
      "Dashboard statistics error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard statistics.",
    });
  }
};
