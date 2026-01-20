import express from "express";
import { getHoaById, getHoas, updateHoaById, initiateSquareAuth, squareOAuthCallback } from "../controllers/hoaController.js";

const router = express.Router();

router.get("/", getHoas);
router.post("/square/callback", squareOAuthCallback);
router.get("/:id", getHoaById);
router.put("/:id", updateHoaById);
router.get("/:id/square/auth", initiateSquareAuth);

export default router;
