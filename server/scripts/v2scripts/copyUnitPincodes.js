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
      const unitnumber = String(unit.unitnumber);
      const pincodeary = [
        { pincode: `${unitnumber}01`, action: "renter", expire_date: null, uses_allowed: -1, uses_used: 0 },
        { pincode: `${unitnumber}02`, action: "dayuseonly", expire_date: null, uses_allowed: -1, uses_used: 0 }
      ];

      if (JSON.stringify(unit.pincodeary) === JSON.stringify(pincodeary)) continue;

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
