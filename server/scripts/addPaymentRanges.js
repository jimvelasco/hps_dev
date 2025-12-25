import mongoose from "mongoose";
import dotenv from "dotenv";
import Hoa from "../src/models/Hoa.js";

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hps-v1");
    console.log("Connected to MongoDB");

    const result = await Hoa.updateMany(
      { payment_ranges: { $exists: false } },
      { $set: { payment_ranges: [] } }
    );

    console.log(`✓ Updated ${result.modifiedCount} HOA documents`);
    console.log(`✓ Matched ${result.matchedCount} HOA documents`);

    await mongoose.connection.close();
    console.log("Migration complete");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

migrate();
