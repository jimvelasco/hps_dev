import mongoose from "mongoose";
import connectDB from "../../src/config/db.js";

const copyRenterVehicleOwnerType = async () => {
  try {
    await connectDB();

    const result = await mongoose.connection.db.collection("vehicles").updateMany(
      { carownertype: "renter", createdbytype: { $ne: "other" } },
      { $set: { createdbytype: "other" } }
    );

    console.log(`Renter vehicles matched: ${result.matchedCount}, updated: ${result.modifiedCount}`);
  } catch (error) {
    console.error("Error copying renter vehicle owner types:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

copyRenterVehicleOwnerType();

// from server dir
//node scripts/v2scripts/copyRenterVehicleOwnerType.js
