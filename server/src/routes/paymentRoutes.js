import express from "express";
import { recordParkingPayment, processSquarePayment, getPayments, processRefund } from "../controllers/paymentController.js";
//import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/record-parking", recordParkingPayment);
router.post("/square", processSquarePayment);
router.get("/", getPayments);
router.post("/refund", processRefund);

export default router;