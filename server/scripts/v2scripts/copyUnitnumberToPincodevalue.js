import mongoose from "mongoose";
import connectDB from "../../src/config/db.js";

const copyUnitnumberToPincodevalue = async () => {
  try {
    await connectDB();

 //   const db = mongoose.connection.useDb("hps_dev");
    const result = await mongoose.connection.db.collection("vehicles").updateMany(
      {
        carownertype: { $in: ["renter", "visitor"] },
        unitnumber: { $type: "string" },
        $expr: { $ne: ["$pin_code_value", "$unitnumber"] }
      },
      [{ $set: { pin_code_value: "$unitnumber" } }]
    );

    console.log(`Vehicles matched: ${result.matchedCount}, updated: ${result.modifiedCount}`);
  } catch (error) {
    console.error("Error copying vehicle unit numbers to PIN code values:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

copyUnitnumberToPincodevalue();

// from server dir
//node scripts/v2scripts/copyUnitnumberToPincodevalue.js
//heroku run node server/scripts/v2scripts/copyUnitnumberToPincodevalue.js -a hoaparking-test
