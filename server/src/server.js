import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import hoaRoutes from "./routes/hoaRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";
dotenv.config();
connectDB();


//console.log("Loaded env:", process.env.USER);

// Catch-all error handler (must be last middleware)


const app = express();
app.use(cors());
app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
app.use("/api/users", userRoutes);
app.use("/api/hoas", hoaRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/payments", paymentRoutes);

//app.use(errorHandler);

const PORT = process.env.VITE_PORT || 5002; 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));