import express from "express";
import { getUsers, getUserById, createUser, updateUser, updateAllUsers, loginUser, getCurrentUser,verifyRenterPin, forgotPassword, resetPassword, deleteUser, sendEmailFromHoa } from "../controllers/userController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import validateRequest from "../middleware/validateRequest.js";
import { updateUserDetailsSchema ,updateUserProfileSchema} from "../schemas/userSchemas.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/me", authenticateToken, getCurrentUser);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/batch/update-parking", authenticateToken, updateAllUsers);
router.put("/:id", validateRequest(updateUserDetailsSchema), updateUser);
router.put("/profile/:id", validateRequest(updateUserProfileSchema), updateUser);
router.delete("/:id", deleteUser);
router.post("/login", loginUser);
router.post("/renters/verify-pin", verifyRenterPin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/send-email-from-hoa", sendEmailFromHoa);

export default router;