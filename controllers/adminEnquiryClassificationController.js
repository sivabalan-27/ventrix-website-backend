
import Contact from "../models/Contact.js";
import classifyLeadEnquiry from "../services/leadClassificationService.js";

const VALID_CATEGORIES = [
  "Web Development",
  "Mobile App Development",
  "AI & Automation",
  "Digital Marketing",
  "IT Consulting",
  "General Enquiry",
];

const VALID_PRIORITIES = ["High", "Medium", "Low"];

const VALID_SERVICES = [
  "Web Development",
  "Mobile Application Development",
  "AI & Automation Solutions",
  "Software Development",
  "Digital Marketing",
  "IT Consulting",
  "General Enquiry",
];

const BATCH_SIZE = 20;

const isValidClassification = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }

  const summary =
    typeof data.summary === "string"
      ? data.summary.trim()
      : "";

  return (
    VALID_CATEGORIES.includes(data.category) &&
    VALID_PRIORITIES.includes(data.priority) &&
    VALID_SERVICES.includes(data.recommendedService) &&
    summary.length > 0 &&
    summary.length <= 300
  );
};

export const reclassifyMissingEnquiries = async (req, res) => {
  try {
    const enquiries = await Contact.find({
      $or: [
        { aiClassification: { $exists: false } },
        { aiClassification: null },
      ],
    })
      .select("_id subject message")
      .sort({ createdAt: 1, _id: 1 })
      .limit(BATCH_SIZE)
      .lean();

    let processed = 0;
    let skipped = 0;
    const failures = [];

    for (const enquiry of enquiries) {
      try {
        const classification = await classifyLeadEnquiry({
          subject: enquiry.subject,
          message: enquiry.message,
        });

        if (!isValidClassification(classification)) {
          throw new Error("Invalid AI classification response.");
        }

        const result = await Contact.updateOne(
          {
            _id: enquiry._id,
            $or: [
              { aiClassification: { $exists: false } },
              { aiClassification: null },
            ],
          },
          {
            $set: {
              aiClassification: {
                category: classification.category,
                priority: classification.priority,
                summary: classification.summary.trim(),
                recommendedService:
                  classification.recommendedService,
              },
            },
          },
          { runValidators: true }
        );

        if (result.modifiedCount === 1) {
          processed++;
        } else {
          // Another request may have classified this enquiry already.
          skipped++;
        }
      } catch (error) {
        console.error(
          `Classification failed for ${enquiry._id}:`,
          error.message
        );

        failures.push({
          enquiryId: enquiry._id,
          reason: "Classification failed. Check server logs.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Enquiry reclassification batch completed.",
      total: enquiries.length,
      processed,
      skipped,
      failed: failures.length,
      remainingBatchLimit: BATCH_SIZE,
      failures,
    });
  } catch (error) {
    console.error(
      "Reclassification error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to reclassify enquiries.",
    });
  }
};
