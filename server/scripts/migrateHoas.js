// server/scripts/migrateHoas.js

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const migrate = async () => {
  try {
    console.log("\n========================================");
    console.log("  HOA TABLE MIGRATION SCRIPT");
    console.log("========================================\n");

    // === STEP 1: CONNECT TO OLD DATABASE ===
    const oldDbUri = process.env.OLD_MONGODB_URI || "mongodb://localhost:27017/hoaparking_dev";
    const oldConnection = await mongoose.createConnection(oldDbUri);
    console.log("✓ Connected to old database: hoaparking_dev");

    // Create model for old database (no strict schema - accepts any fields)
    const OldHoa = oldConnection.model("Hoa", new mongoose.Schema({}, { strict: false }));

    // === STEP 2: CONNECT TO NEW DATABASE ===
    const newDbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/hps-v1";
    const newConnection = await mongoose.createConnection(newDbUri);
    console.log("✓ Connected to new database: hps-v1");

    // Create model for new database
    const NewHoa = newConnection.model("Hoa", new mongoose.Schema({}, { strict: false }));

    // === STEP 3: DEFINE FIELD MAPPING ===
    // Format: "oldFieldName": "newFieldName"
    // ONLY fields listed here will be migrated
    const fieldMapping = {
      hoaid: "hoaid",
      name: "name",
      hoa_phone_office: "hoa_phone_office",
      parking_allowed: "inventory_allowed_owner",
      parking_allowed_owner: "parking_allowed_owner",
      renter_free_parking_spots: "renter_free_parking_spots"
      // Add more mappings below as needed:
      // address: "address",
      // city: "city",
      // state: "state",
      // zip: "zip",
    };

    // === ARRAY FIELD MAPPINGS ===
    // For arrays of objects, map the field names within each object
    // Format: "arrayFieldName": { "oldFieldInObject": "newFieldInObject" }
    const arrayFieldMappings = {
      payment_ranges: {
        startDayMo: "startDayMo",      // Adjust if old field names differ
        endDayMo: "endDayMo",
        rate: "rate",
        description: "description"
      },
      contact_information: {
        contact_id: "contact_id",
        phone_number: "phone_number",
        phone_description: "phone_description",
        email: "email"
      }
      // Add more array mappings as needed
    };

    console.log("\n📋 Field Mapping Configuration:");
    console.log("──────────────────────────────");
    Object.entries(fieldMapping).forEach(([oldField, newField]) => {
      if (oldField === newField) {
        console.log(`  ${oldField} → ${newField} (same name)`);
      } else {
        console.log(`  ${oldField} → ${newField} (renamed)`);
      }
    });

    console.log("\n📋 Array Field Mapping Configuration:");
    console.log("─────────────────────────────────────");
    Object.entries(arrayFieldMappings).forEach(([arrayName, fieldMap]) => {
      console.log(`  ${arrayName}:`);
      Object.entries(fieldMap).forEach(([oldKey, newKey]) => {
        if (oldKey === newKey) {
          console.log(`    ${oldKey} → ${newKey} (same name)`);
        } else {
          console.log(`    ${oldKey} → ${newKey} (renamed)`);
        }
      });
    });

    // === STEP 4: FETCH DATA FROM OLD DATABASE ===
    console.log("\n🔍 Fetching data from old database...");
    const oldHoas = await OldHoa.find();
    console.log(`✓ Found ${oldHoas.length} Hoa documents in old database\n`);

    if (oldHoas.length === 0) {
      console.log("⚠️  No data to migrate. Exiting.");
      process.exit(0);
    }

    // === STEP 5: TRANSFORM DATA USING FIELD MAPPING ===
    // This is where fieldMapping and arrayFieldMappings are used
    console.log("🔄 Transforming data...");
    const migratedHoas = oldHoas.map((oldHoa, index) => {
      const newHoa = {};

      // === Transform scalar fields ===
      Object.entries(fieldMapping).forEach(([oldField, newField]) => {
        // Check if the old field exists in the old record
        if (oldHoa.hasOwnProperty(oldField)) {
          // Get the value from old field
          const value = oldHoa[oldField];

          // Only copy if value is not undefined
          if (value !== undefined) {
            // Assign to new field name in the new record
            newHoa[newField] = value;
            
            if (index === 0) {
              // Show first transformation as example
              console.log(`  Sample scalar: oldHoa.${oldField} → newHoa.${newField}`);
            }
          }
        }
      });

      // === Transform array fields ===
      Object.entries(arrayFieldMappings).forEach(([arrayFieldName, fieldMap]) => {
        // Check if the array field exists in the old record
        if (oldHoa.hasOwnProperty(arrayFieldName) && Array.isArray(oldHoa[arrayFieldName])) {
          // Transform each object in the array
          newHoa[arrayFieldName] = oldHoa[arrayFieldName].map((item, itemIndex) => {
            const transformedItem = {};
            
            // Map each field in the array object
            Object.entries(fieldMap).forEach(([oldKey, newKey]) => {
              if (item.hasOwnProperty(oldKey) && item[oldKey] !== undefined) {
                transformedItem[newKey] = item[oldKey];
              }
            });
            
            if (index === 0 && itemIndex === 0) {
              // Show first array transformation as example
              console.log(`  Sample array: oldHoa.${arrayFieldName}[0] with mapped fields`);
            }
            
            return transformedItem;
          });
        }
      });

      return newHoa;
    });

    console.log(`✓ Transformed ${migratedHoas.length} documents\n`);

    // === STEP 6: DISPLAY SAMPLE OF MIGRATED DATA ===
    console.log("📋 Sample migrated data (first record):");
    console.log("──────────────────────────────────────");
    console.log(JSON.stringify(migratedHoas[0], null, 2));
    console.log("");

    // === STEP 7: CLEAR NEW DATABASE TABLE ===
    console.log("🗑️  Clearing existing documents from new database...");
    const deleteResult = await NewHoa.deleteMany({});
    console.log(`✓ Deleted ${deleteResult.deletedCount} existing documents from new database\n`);

    // === STEP 8: INSERT DATA INTO NEW DATABASE ===
    console.log("💾 Inserting into new database...");
    const result = await NewHoa.insertMany(migratedHoas);
    console.log(`✓ Successfully inserted ${result.length} Hoa documents\n`);

    // === STEP 9: VERIFICATION ===
    console.log("✅ Verification:");
    console.log("──────────────");
    const verifyCount = await NewHoa.countDocuments();
    console.log(`✓ New database (hps-v1) now contains ${verifyCount} Hoa documents`);
    console.log(`✓ Old database (hoaparking_dev) contains ${oldHoas.length} Hoa documents`);

    if (verifyCount === oldHoas.length) {
      console.log("✓ ✓ ✓ MIGRATION SUCCESSFUL - All records migrated!\n");
    } else {
      console.log("⚠️  WARNING - Record count mismatch!\n");
    }

    // === STEP 10: CHECK FOR DUPLICATES ===
    console.log("🔍 Checking for duplicate records...");
    const duplicates = await NewHoa.aggregate([
      { $group: { _id: "$hoaid", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicates.length > 0) {
      console.log("⚠️  WARNING - Duplicate hoaids found:\n");
      duplicates.forEach(d => {
        console.log(`  hoaid: ${d._id}, count: ${d.count}`);
      });
      console.log("");
    } else {
      console.log("✓ No duplicate records found - data integrity verified!\n");
    }

  } catch (error) {
    console.error("\n❌ Migration error:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    // Close all connections
    await mongoose.disconnect();
    console.log("========================================");
    console.log("  Migration complete - connections closed");
    console.log("========================================\n");
  }
};

// Run the migration
migrate();
