import express from "express";
import { getUsers, getUserById, createUser, updateUser, loginUser, getCurrentUser,verifyRenterPin, forgotPassword, resetPassword } from "../controllers/userController.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/me", authenticateToken, getCurrentUser);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.post("/login", loginUser);
router.post("/renters/verify-pin", verifyRenterPin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;