import mongoose from "mongoose";
import User from "../../src/models/User.js";
import Unit from "../../src/models/Unit.js";
import connectDB from "../../src/config/db.js";

const populateUnitTable = async () => {
  try {
    await connectDB();

    const connection = mongoose.connection.useDb("hps_dev");
    const SourceUser = connection.model("UnitTableSourceUser", User.schema, User.collection.name);
    const units = connection.model("units", Unit.schema, "units");
    const fields = Object.keys(Unit.schema.paths).filter(
      field => !["_id", "hoaid", "unitnumber", "createdAt", "updatedAt", "__v"].includes(field)
    );
    const seen = new Set();
    let created = 0;
    let updated = 0;
    let skipped = 0;

    const exists = await connection.db.listCollections({ name: "units" }).hasNext();
    if (!exists) await units.createCollection();

    for await (const user of SourceUser.find().sort({ hoaid: 1, unitnumber: 1, role: 1, _id: 1 }).lean().cursor()) {
      if (!user.hoaid || !user.unitnumber) {
        skipped++;
        continue;
      }

      const key = JSON.stringify([user.hoaid, user.unitnumber]);
      if (seen.has(key)) {
        skipped++;
        continue;
      }
      seen.add(key);

      const values = { hoaid: user.hoaid, unitnumber: user.unitnumber };
      for (const field of fields) {
        if (user[field] !== undefined) values[field] = user[field];
      }

      const result = await units.updateOne(
        { hoaid: user.hoaid, unitnumber: user.unitnumber },
        { $set: values, $setOnInsert: { _id: new mongoose.Types.ObjectId() } },
        { upsert: true, runValidators: true }
      );

      if (result.upsertedCount) created++;
      else if (result.modifiedCount) updated++;
    }

    console.log(`units records created: ${created}, updated: ${updated}, users skipped: ${skipped}`);
  } catch (error) {
    console.error("Error populating units:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

populateUnitTable();

// from server dir
//node scripts/v2scripts/populateUnitTable.js
