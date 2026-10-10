import mongoose from "mongoose";
import connectDB from "../../src/config/db.js";

const copyUnitPincodes = async () => {
  try {
    await connectDB();

    const connection = mongoose.connection.useDb("hps_dev");
    const units = connection.db.collection("units");
    let examined = 0;
    let updated = 0;

    for await (const unit of units.find({ pincode: { $exists: true, $ne: null } }, { projection: { pincode: 1, pincodeary: 1 } })) {
      examined++;
      const pincode = String(unit.pincode);
      const entries = Array.isArray(unit.pincodeary) ? unit.pincodeary : [];
      const firstEntry = entries[0] && typeof entries[0] === "object" && !Array.isArray(entries[0])
        ? entries[0]
        : {};

      if (firstEntry.pincode === pincode) continue;

      const pincodeary = [{ ...firstEntry, pincode }, ...entries.slice(1)];
      const result = await units.updateOne({ _id: unit._id }, { $set: { pincodeary } });
      updated += result.modifiedCount;
    }

    console.log(`Database: ${connection.name}, collection: units, examined: ${examined}, updated: ${updated}`);
  } catch (error) {
    console.error("Error copying unit PIN codes:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

copyUnitPincodes();


// from server dir
//node scripts/v2scripts/copyUnitPincodes.js
//heroku run node server/scripts/copyUnitPincodes.js -a hoaparking-test
