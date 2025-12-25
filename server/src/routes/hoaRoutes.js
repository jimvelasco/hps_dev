import express from "express";
import { getHoaById, getHoas, updateHoaById } from "../controllers/hoaController.js";

const router = express.Router();

router.get("/", getHoas);
router.get("/:id", getHoaById);
router.put("/:id", updateHoaById);

export default router;
