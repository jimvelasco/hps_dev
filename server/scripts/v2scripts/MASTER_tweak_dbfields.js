import mongoose from "mongoose";
import connectDB from "../../src/config/db.js";

const operations = [
  ["hoas", { $set: { daypasses_allowed_owner: 1 } }],
  ["hoas", { $set: { parking_allowed_tenant: 2 } }],
  ["hoas", { $set: { tenant_free_parking_spots: 2 } }],
  ["hoas", { $set: { daypasses_allowed_tenant: 0 } }],
  ["hoas", { $set: { daypasses_allowed_renter: 0 } }],
  ["hoas", { $set: { parking_handicapped_hoa: 0 } }],
  ["units", { $unset: { pincodeary: "" } }],
  ["units", { $set: { pincodeary: [{ pincode: "", action: "renter", description: "", expire_date: null, uses_allowed: -1, uses_used: 0 }] } }],
  ["units", { $set: { available_for_rent: 1 } }],
  ["units", { $set: { is_resident: 0 } }],
  ["units", { $set: { parking_allowed_unit: 2 } }],
  ["units", { $set: { daypasses_allowed_owner: 1 } }],
  ["units", { $set: { parking_allowed_tenant: 2 } }],
  ["units", { $set: { tenant_free_parking_spots: 2 } }],
  ["units", { $set: { daypasses_allowed_tenant: 0 } }],
  ["units", { $set: { daypasses_allowed_renter: 0 } }],
  ["units", { $set: { day_use_only: 0 } }],
  ["vehicles", { $set: { day_use_only: 0 } }],
  ["vehicles", { $set: { createdbytype: "owner" } }],
  ["vehicles", { $set: { pin_code_value: "" } }],
  ["vehicles", { $set: { pin_code_action: "renter" } }]
];

const tweakDbFields = async () => {
  try {
    await connectDB();

    for (const [collection, update] of operations) {
      const result = await mongoose.connection.db.collection(collection).updateMany({}, update);
      console.log(`${collection}: matched ${result.matchedCount}, updated ${result.modifiedCount}`);
    }
  } catch (error) {
    console.error("Error updating database fields:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

tweakDbFields();
