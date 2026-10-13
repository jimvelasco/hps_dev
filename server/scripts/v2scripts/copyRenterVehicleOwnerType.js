import mongoose from "mongoose";
import connectDB from "../../src/config/db.js";

const copyRenterVehicleOwnerType = async () => {
  try {
    await connectDB();

    const db = mongoose.connection.useDb("hps_dev");
    const result = await db.db.collection("vehicles").updateMany(
      { carownertype: "renter", createdbytype: { $ne: "renter" } },
      [{ $set: { createdbytype: "$carownertype" } }]
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
