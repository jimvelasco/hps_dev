import mongoose from "mongoose";
import Payment from "../src/models/Payment.js";
import dotenv from "dotenv";

dotenv.config();

const migratePayments = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hps_dev");
    console.log("Connected to MongoDB");

    console.log("Checking for totalRefunded field...");
    const collection = mongoose.connection.collection("payments");
    
    const sampleDoc = await collection.findOne({});
    if (sampleDoc && sampleDoc.totalRefunded !== undefined) {
      console.log("✓ totalRefunded field already exists");
      console.log("Migration skipped");
      await mongoose.disconnect();
      return;
    }

    console.log("Starting migration...");
    
    const result = await collection.updateMany(
      {},
      [
        {
          $set: {
            totalRefunded: { $ifNull: ["$refundAmount", 0] }
          }
        }
      ]
    );

    console.log(`✓ Migration completed`);
    console.log(`  - Matched documents: ${result.matchedCount}`);
    console.log(`  - Modified documents: ${result.modifiedCount}`);

    const verifyResult = await Payment.find({ totalRefunded: { $exists: false } });
    if (verifyResult.length === 0) {
      console.log("✓ All documents now have totalRefunded field");
    } else {
      console.log(`⚠ Warning: ${verifyResult.length} documents still missing totalRefunded`);
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

migratePayments();
