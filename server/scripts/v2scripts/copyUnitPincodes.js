import mongoose from "mongoose";
import connectDB from "../../src/config/db.js";
// on 10/14/2026 we made a change.  Originaly we got the pincode and put it in the array.  Now we use unitnumber for the
// instead of pincode
const copyUnitPincodes = async (hoaId = "") => {
  try {
    await connectDB();

    const connection = mongoose.connection;
    const units = connection.db.collection("units");
    let examined = 0;
    let updated = 0;
    const filter = { unitnumber: { $exists: true, $ne: null } };
    if (hoaId) filter.hoaid = hoaId;

    for await (const unit of units.find(filter, { projection: { unitnumber: 1, pincodeary: 1 } })) {
      examined++;
      const unitnumber = String(unit.unitnumber);
      const pincodeary = [
        { pincode: `${unitnumber}1`, action: "renter", expire_date: null, uses_allowed: -1, uses_used: 0 },
        { pincode: `${unitnumber}2`, action: "dayuseonly", expire_date: null, uses_allowed: -1, uses_used: 0 }
      ];

      if (JSON.stringify(unit.pincodeary) === JSON.stringify(pincodeary)) continue;

      const result = await units.updateOne({ _id: unit._id }, { $set: { pincodeary } });
      updated += result.modifiedCount;
    }

    console.log(`Database: ${connection.name}, HOA: ${hoaId || "all"}, collection: units, examined: ${examined}, updated: ${updated}`);
  } catch (error) {
    console.error("Error copying unit PIN codes:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

copyUnitPincodes(process.argv[2]?.trim());


// from server dir
//node scripts/v2scripts/copyUnitPincodes.js
//heroku run node server/scripts/copyUnitPincodes.js -a hoaparking-test

// mongodump --uri "mongodb://localhost:27017/1117_hps_prod" --db="1117_hps_prod" --archive="source.archive"
// mongorestore --uri "mongodb://localhost:27017/1117_hps_prod" --archive="source.archive" --nsFrom="1117_hps_prod.*" --nsTo="1117_hps_prod_2.*"

/*
mongodump --uri="<HPS_DEV_ATLAS_URI>" \
  --db="hps_dev" \
  --archive="$HOME/Downloads/hps_dev.archive"

mongosh "<HPS_PROD_ATLAS_URI>" --eval 'db.dropDatabase()'

mongorestore --uri="<HPS_PROD_ATLAS_URI>" \
  --archive="$HOME/Downloads/hps_dev.archive" \
  --nsFrom="hps_dev.*" \
  --nsTo="hps_prod.*"

*/