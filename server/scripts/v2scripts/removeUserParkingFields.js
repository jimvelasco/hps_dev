import mongoose from "mongoose";
import connectDB from "../../src/config/db.js";

const removeUserParkingFields = async () => {
  try {
    await connectDB();

    const db = mongoose.connection.useDb("hps_dev");
    const result = await db.db.collection("users").updateMany(
      {},
      {
        $unset: {
          parking_allowed_renter: "",
          owner_free_parking: "",
          renter_free_parking: "",
          pincode: ""
        }
      }
    );

    console.log(`Users matched: ${result.matchedCount}, users updated: ${result.modifiedCount}`);
  } catch (error) {
    console.error("Error removing user fields:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

removeUserParkingFields();

//node scripts/v2scripts/removeUserParkingFields.js

