import express from "express";
import { getHoaById, getHoas, updateHoaById, createStripeConnectAccount, getStripeAccountStatus } from "../controllers/hoaController.js";

const router = express.Router();

router.get("/", getHoas);
router.get("/:id", getHoaById);
router.put("/:id", updateHoaById);
router.post("/:id/stripe-connect", createStripeConnectAccount);
router.get("/:id/stripe-status", getStripeAccountStatus);

export default router;
