import mongoose from 'mongoose';
import Vehicle from '../src/models/Vehicle.js';
import connectDB from '../src/config/db.js';

const updateVehicleEnddate = async () => {
  try {
    await connectDB();
    
    const newEndDate = '2026-07-01';
    const newCheckoutDate = new Date('2026-07-01T00:00:00.000Z');
    
    console.log(`Updating vehicles with enddate '1970-01-01' to ${newEndDate}...`);
    const enddateResult = await Vehicle.updateMany(
      { enddate: '1970-01-01' }, 
      { $set: { enddate: newEndDate } }
    );
    console.log(`Successfully updated ${enddateResult.modifiedCount} vehicles' enddate.`);

    console.log(`Updating vehicles with checkout '1970-01-01' to ${newCheckoutDate.toISOString()}...`);
    // Using Vehicle.collection to bypass Mongoose schema casting for the checkout field
    const checkoutResult = await Vehicle.collection.updateMany(
      { 
        $or: [
          { checkout: new Date('1970-01-01T00:00:00.000Z') },
          { checkout: '1970-01-01' },
          { checkout: '1970-01-01T00:00:00.000+00:00' },
          { checkout: { $type: 'string', $regex: /1970-01-01/ } }
        ]
      },
      { $set: { checkout: newCheckoutDate } }
    );
    console.log(`Successfully updated ${checkoutResult.modifiedCount} vehicles' checkout.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating vehicle enddates:', error);
    process.exit(1);
  }
};

updateVehicleEnddate();

// from server directory
//node scripts/updateVehicleEnddate.js

// on heroku
//heroku run node server/scripts/updateVehicleEnddate.js -a your-app-name
