import mongoose from "mongoose";
import Unit from "../../src/models/Unit.js";
import connectDB from "../../src/config/db.js";

const createUnitTable = async () => {
  try {
    await connectDB();

    const db = mongoose.connection.useDb("hps_dev");
    const units = db.model("units", Unit.schema, "units");
    const exists = await db.db.listCollections({ name: "units" }).hasNext();

    if (!exists) {
      await units.createCollection();
      console.log("Created units in hps_dev");
    } else {
      console.log("units already exists in hps_dev");
    }
  } catch (error) {
    console.error("Error creating units:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createUnitTable();


// from server dir
//node scripts/v2scripts/createUnitTable.js
//heroku run node server/scripts/createUnitTable.js -a hoaparking-test
