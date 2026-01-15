import express from "express";
import { recordParkingPayment, processSquarePayment } from "../controllers/paymentController.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();


//router.post("/", makeParkingPayment);
router.post("/record-parking", recordParkingPayment);
router.post("/square", processSquarePayment);

export default router;