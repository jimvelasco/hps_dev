import mongoose from "mongoose";
import connectDB from "../../src/config/db.js";

const copyUserPincodeToUnitPincodeAry = async (hoaId = "") => {
  try {
    await connectDB();

    const connection = mongoose.connection;
    const users = connection.db.collection("users");
    const units = connection.db.collection("units");
    const filter = {
      hoaid: { $type: "string", $ne: "" },
      unitnumber: { $type: "string", $ne: "" }
    };
    if (hoaId) filter.hoaid = hoaId;

    let examined = 0;
    let updated = 0;
    let missingUserPin = 0;
    let conflictingUserPins = 0;
    let missingRenterEntry = 0;

    for await (const unit of units.find(filter, { projection: { hoaid: 1, unitnumber: 1, pincodeary: 1 } })) {
      examined++;
      if (!Array.isArray(unit.pincodeary) || unit.pincodeary[0]?.action !== "renter") {
        missingRenterEntry++;
        continue;
      }

      const pincodes = new Set();
      for await (const user of users.find(
        { hoaid: unit.hoaid, unitnumber: unit.unitnumber, pincode: { $type: "string", $ne: "" } },
        { projection: { pincode: 1 } }
      )) {
        if (user.pincode.trim()) pincodes.add(user.pincode);
        if (pincodes.size > 1) break;
      }

      if (pincodes.size === 0) {
        missingUserPin++;
        continue;
      }
      if (pincodes.size > 1) {
        conflictingUserPins++;
        console.warn(`Skipping ${unit.hoaid} unit ${unit.unitnumber}: conflicting user PIN codes`);
        continue;
      }

      const [pincode] = pincodes;
      if (unit.pincodeary[0].pincode === pincode) continue;

      const result = await units.updateOne(
        { _id: unit._id, "pincodeary.0.action": "renter" },
        { $set: { "pincodeary.0.pincode": pincode } }
      );
      updated += result.modifiedCount;
    }

    console.log(`Database: ${connection.name}, HOA: ${hoaId || "all"}, units examined: ${examined}, updated: ${updated}, missing user PIN: ${missingUserPin}, conflicting user PINs: ${conflictingUserPins}, missing renter entry: ${missingRenterEntry}`);
  } catch (error) {
    console.error("Error copying user PIN codes to unit PIN arrays:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

copyUserPincodeToUnitPincodeAry(process.argv[2]?.trim());
