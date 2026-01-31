import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dropObsoleteIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hps_dev");
    console.log("Connected to MongoDB");

    const collections = await mongoose.connection.db.listCollections().toArray();
    const paymentCollectionExists = collections.find(c => c.name === 'payments');

    if (paymentCollectionExists) {
      const collection = mongoose.connection.db.collection('payments');
      const indexes = await collection.indexes();
      console.log("Current indexes on payments collection:", indexes.map(i => i.name));

      const obsoleteIndexes = ['sq_paymentId_1', 'squarePaymentId_1', 'squareRefundId_1'];
      
      for (const indexName of obsoleteIndexes) {
        if (indexes.find(i => i.name === indexName)) {
          console.log(`Dropping obsolete index: ${indexName}`);
          await collection.dropIndex(indexName);
          console.log(`✓ Successfully dropped ${indexName}`);
        }
      }
    } else {
      console.log("Payments collection not found.");
    }

    await mongoose.connection.close();
    console.log("Index cleanup complete");
  } catch (error) {
    console.error("Error during index cleanup:", error);
    process.exit(1);
  }
};

dropObsoleteIndexes();

//heroku run node server/scripts/dropObsoleteIndexes.js -a your-app-name

//node server/scripts/dropObsoleteIndexes.js

