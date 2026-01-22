import express from "express";
import { recordParkingPayment, getPayments, processRefund, createStripePaymentIntent } from "../controllers/paymentController.js";
//import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/record-parking", recordParkingPayment);
router.post("/create-payment-intent", createStripePaymentIntent);
router.get("/", getPayments);
router.post("/refund", processRefund);

export default router;