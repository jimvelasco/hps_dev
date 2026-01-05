import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import hoaRoutes from "./routes/hoaRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import violationRoutes from "./routes/violationRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/users", userRoutes);
app.use("/api/hoas", hoaRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/violations", violationRoutes);

// Reset password redirect
app.get("/reset-password/:token", (req, res) => {
  try {
    const { token } = req.params;
    jwt.verify(token, process.env.JWT_SECRET);

    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientURL}/reset-password?token=${token}`);
  } catch {
    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientURL}/reset-password-error?message=Token%20expired%20or%20invalid`);
  }
});

// ---------- VITE STATIC SERVING ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(
      path.join(__dirname, "../../client/dist/index.html")
    );
  });
}

// Error handler LAST
app.use(errorHandler);

// Listen LAST
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});