import express from "express";
import {
  getViolationsByHoaId,
  getViolationById,
  createViolation,
  updateViolation,
  deleteViolation
} from "../controllers/violationController.js";

const router = express.Router();

router.get("/:hoaId", getViolationsByHoaId);
router.get("/id/:violationId", getViolationById);
router.post("/", createViolation);
router.put("/:violationId", updateViolation);
router.delete("/:violationId", deleteViolation);

export default router;
