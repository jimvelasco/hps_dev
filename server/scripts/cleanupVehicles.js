import mongoose from 'mongoose';
import Vehicle from '../src/models/Vehicle.js';
import connectDB from '../src/config/db.js';

const cleanupExpiredRenters = async () => {
  await connectDB();
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

  const result = await Vehicle.deleteMany({
    carownertype: 'renter',
    enddate: { $lt: today }
  });

  console.log(`Deleted ${result.deletedCount} expired renter vehicles.`);
  process.exit(0);
};

cleanupExpiredRenters();

// this must be run from the server directory
//cd server && node scripts/cleanupVehicles.js

