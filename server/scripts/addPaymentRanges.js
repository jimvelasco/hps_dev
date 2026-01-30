import mongoose from "mongoose";
import dotenv from "dotenv";
import Hoa from "../src/models/Hoa.js";

dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hps_dev");
    console.log("Connected to MongoDB");

    const result = await Hoa.updateMany(
      {}, // Update all HOAs
      { 
        $set: { 
          payment_ranges: [{
            startDayMo: '01-01',
            endDayMo: '12-31',
            rate: 20,
            rate_2nd: 20,
            description: 'default'
          }] 
        } 
      }
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
