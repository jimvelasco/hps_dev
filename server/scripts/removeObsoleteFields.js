import mongoose from "mongoose";
import dotenv from "dotenv";
import Vehicle from "../src/models/Vehicle.js";
import User from "../src/models/User.js";
import Hoa from "../src/models/Hoa.js";

dotenv.config();

const removeObsoleteFields = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hps_dev");
    console.log("Connected to MongoDB",process.env.MONGO_URI);

    // 1. Update Vehicles
    const vehicleResult = await Vehicle.updateMany({}, { 
      $unset: { 
        change_history: "", 
        change_history_test: "", 
        number_of_changes: "", 
        active_flag: "",
        has_read_terms: "" 
      } 
    }, { strict: false });
    console.log(`✓ Vehicles: Matched ${vehicleResult.matchedCount}, Modified ${vehicleResult.modifiedCount}`);
//db.users.updateMany({}, { $unset: { has_read_terms: "" } })

    // 2. Update Users
    const userResult = await User.updateMany({}, { 
      $unset: { 
        crud: "", 
        is_verified: "", 
        has_read_terms: "",
        parking_allowed: ""  
      } 
    }, { strict: false });
    console.log(`✓ Users: Matched ${userResult.matchedCount}, Modified ${userResult.modifiedCount}`);

    // 3. Update HOAs
    const hoaResult = await Hoa.updateMany({}, { 
      $unset: { 
        season_adjust_unit: "", 
        season_adjust_renter: "", 
        season_parking_fee_factor: "", 
        use_availabilty_factor: "", 
        use_renter_creditcard: "", 
        use_owner_creditcard: "", 
        use_renter_ppp: "", 
        use_owner_ppp: "", 
        use_warning_status: "", 
        availability_warning_buffer: "",
        parking_allowed_unit: "",
        background_image_url: ""
      } 
    });
    console.log(`✓ HOAs: Matched ${hoaResult.matchedCount}, Modified ${hoaResult.modifiedCount}`);

    await mongoose.connection.close();
    console.log("Field removal complete");
  } catch (error) {
    console.error("Error during field removal:", error);
    process.exit(1);
  }
};

removeObsoleteFields();

// from server directory
//node scripts/removeObsoleteFields.js

// on heroku
//heroku run node server/scripts/removeObsoleteFields.js -a your-app-name
