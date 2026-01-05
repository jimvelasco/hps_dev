import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
     console.log("MongoDB " + process.env.MONGO_URI);  
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected and running");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;