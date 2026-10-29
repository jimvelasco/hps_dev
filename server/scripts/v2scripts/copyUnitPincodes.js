import mongoose from "mongoose";
import connectDB from "../../src/config/db.js";
// on 10/14/2026 we made a change.  Originaly we got the pincode and put it in the array.  Now we use unitnumber for the
// instead of pincode
const copyUnitPincodes = async () => {
  try {
    await connectDB();

    const connection = mongoose.connection;
    const units = connection.db.collection("units");
    let examined = 0;
    let updated = 0;

    for await (const unit of units.find({ unitnumber: { $exists: true, $ne: null } }, { projection: { unitnumber: 1, pincodeary: 1 } })) {
      examined++;
      const pincode = String(unit.unitnumber);
      const entries = Array.isArray(unit.pincodeary) ? unit.pincodeary : [];
      const firstEntry = entries[0] && typeof entries[0] === "object" && !Array.isArray(entries[0])
        ? entries[0]
        : {};

      const updatedFirstEntry = {
        ...firstEntry,
        pincode,
        action: firstEntry.action || "renter",
        expire_date: firstEntry.expire_date ?? null,
        uses_allowed: firstEntry.uses_allowed ?? -1,
        uses_used: firstEntry.uses_used ?? 0
      };

      if (firstEntry.pincode === updatedFirstEntry.pincode &&
        firstEntry.action === updatedFirstEntry.action &&
        firstEntry.expire_date === updatedFirstEntry.expire_date &&
        firstEntry.uses_allowed === updatedFirstEntry.uses_allowed &&
        firstEntry.uses_used === updatedFirstEntry.uses_used) continue;

      const pincodeary = [updatedFirstEntry, ...entries.slice(1)];
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
