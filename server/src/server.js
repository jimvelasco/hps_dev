import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import hoaRoutes from "./routes/hoaRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import testRoutes from "./routes/testRoutes.js";
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
app.use("/api/tests", testRoutes);



app.get("/reset-password/:token", (req, res) => {
  try {
    const { token } = req.params;

    jwt.verify(token, process.env.JWT_SECRET);

    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientURL}/reset-password?token=${token}`);
  } catch (err) {
    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientURL}/reset-password-error?message=Token%20expired%20or%20invalid`);
  }
});

//app.use(errorHandler);

const PORT = process.env.VITE_PORT || 5002; 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));