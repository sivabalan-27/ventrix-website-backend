
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Application from "../models/Application.js";
import Contact from "../models/Contact.js";

dotenv.config();

const migrateStatuses = async () => {
  try {
    await connectDB();

    const applications = await Application.updateMany(
      { status: { $exists: false } },
      { $set: { status: "Applied" } }
    );

    const enquiries = await Contact.updateMany(
      { status: { $exists: false } },
      { $set: { status: "New" } }
    );

    console.log("Status migration completed.");
    console.log(`Applications updated: ${applications.modifiedCount}`);
    console.log(`Enquiries updated: ${enquiries.modifiedCount}`);
  } catch (error) {
    console.error("Status migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

migrateStatuses();
