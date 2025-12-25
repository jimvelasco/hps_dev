// server/scripts/convertCarownertype.js

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const convert = async () => {
  try {
    console.log("\n========================================");
    console.log("  CAROWNERTYPE CONVERSION SCRIPT");
    console.log("========================================\n");

    // === STEP 1: CONNECT TO DATABASE ===
    const dbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/hps-v1";
    const connection = await mongoose.createConnection(dbUri);
    console.log("✓ Connected to database: hps-v1");

    // Create model for Vehicle collection
    const Vehicle = connection.model("Vehicle", new mongoose.Schema({}, { strict: false }));

    // === STEP 2: FETCH ALL VEHICLES ===
    console.log("\n🔍 Fetching all vehicles from database...");
    const allVehicles = await Vehicle.find();
    console.log(`✓ Found ${allVehicles.length} vehicles\n`);

    if (allVehicles.length === 0) {
      console.log("⚠️  No vehicles found. Exiting.");
      process.exit(0);
    }

    // === STEP 3: IDENTIFY VEHICLES TO UPDATE ===
    console.log("📋 Analyzing carownertype values...");
    const vehiclesToUpdate = [];
    const carownertypeStats = {};

    allVehicles.forEach(vehicle => {
      const currentValue = vehicle.carownertype;
      
      // Track all values found
      if (!carownertypeStats[currentValue]) {
        carownertypeStats[currentValue] = 0;
      }
      carownertypeStats[currentValue]++;

      // Check if value is not "owner" or "renter"
      if (currentValue !== "owner" && currentValue !== "renter") {
        vehiclesToUpdate.push({
          _id: vehicle._id,
          oldValue: currentValue,
          newValue: "owner"
        });
      }
    });

    console.log("✓ Current carownertype values in database:");
    Object.entries(carownertypeStats).forEach(([value, count]) => {
      if (value === "owner" || value === "renter") {
        console.log(`  "${value}": ${count} vehicles (VALID - no change)`);
      } else {
        console.log(`  "${value}": ${count} vehicles (INVALID - will be converted to "owner")`);
      }
    });

    if (vehiclesToUpdate.length === 0) {
      console.log("\n✓ All vehicles have valid carownertype values. No updates needed.\n");
      process.exit(0);
    }

    console.log(`\n⚠️  Found ${vehiclesToUpdate.length} vehicles with invalid carownertype values\n`);

    // === STEP 4: PERFORM UPDATES ===
    console.log("🔄 Converting invalid carownertype values to 'owner'...");
    let successCount = 0;
    let errorCount = 0;

    for (const item of vehiclesToUpdate) {
      try {
        const result = await Vehicle.findByIdAndUpdate(
          item._id,
          { carownertype: item.newValue },
          { new: true }
        );
        
        if (result) {
          successCount++;
          console.log(`  ✓ Vehicle ${item._id}: "${item.oldValue}" → "${item.newValue}"`);
        }
      } catch (err) {
        errorCount++;
        console.error(`  ❌ Vehicle ${item._id}: Failed to update - ${err.message}`);
      }
    }

    console.log("");

    // === STEP 5: VERIFICATION ===
    console.log("✅ Update Summary:");
    console.log("──────────────");
    console.log(`✓ Successfully converted: ${successCount} vehicles`);
    if (errorCount > 0) {
      console.log(`❌ Failed conversions: ${errorCount} vehicles`);
    }

    // Verify the conversions
    console.log("\n🔍 Verification - checking all vehicles again...");
    const updatedVehicles = await Vehicle.find();
    const updatedStats = {};

    updatedVehicles.forEach(vehicle => {
      const value = vehicle.carownertype;
      if (!updatedStats[value]) {
        updatedStats[value] = 0;
      }
      updatedStats[value]++;
    });

    console.log("✓ Final carownertype distribution:");
    Object.entries(updatedStats).forEach(([value, count]) => {
      if (value === "owner" || value === "renter") {
        console.log(`  "${value}": ${count} vehicles ✓`);
      } else {
        console.log(`  "${value}": ${count} vehicles ⚠️`);
      }
    });

    const invalidCount = updatedVehicles.filter(
      v => v.carownertype !== "owner" && v.carownertype !== "renter"
    ).length;

    if (invalidCount === 0) {
      console.log("\n✓ ✓ ✓ CONVERSION SUCCESSFUL - All vehicles have valid carownertype values!\n");
    } else {
      console.log(`\n⚠️  WARNING - ${invalidCount} vehicles still have invalid values!\n`);
    }

  } catch (error) {
    console.error("\n❌ Conversion error:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log("========================================");
    console.log("  Conversion complete - connection closed");
    console.log("========================================\n");
  }
};

// Run the conversion
convert();
