import express from "express";
import multer from "multer";
import authenticateToken from "../middleware/authenticateToken.js";
import { getHoaById, getHoas, updateHoaById, createStripeConnectAccount, getStripeAccountStatus, importHOAUserCSV } from "../controllers/hoaController.js";

const router = express.Router();
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    callback(null, /\.csv$/i.test(file.originalname));
  }
}).single("file");

router.get("/", getHoas);
router.get("/:id", getHoaById);
router.put("/:id", updateHoaById);
router.post("/:id/stripe-connect", createStripeConnectAccount);
router.get("/:id/stripe-status", getStripeAccountStatus);
router.post("/:id/import-users-csv", authenticateToken, (req, res, next) => {
  // if (req.user.role !== "admin" || req.user.hoaId !== req.params.id) {
  console.log('hoaroutes',req.user.role);
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Administrator access required for this HOA" });
  }
  csvUpload(req, res, (error) => {
    if (error) return res.status(400).json({ message: error.message });
    next();
  });
}, importHOAUserCSV);

export default router;
