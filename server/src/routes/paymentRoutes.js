import express from "express";
import { makeParkingPayment, processSquarePayment } from "../controllers/paymentController.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();


//router.post("/", makeParkingPayment);
router.post("/record-parking", makeParkingPayment);
router.post("/square", processSquarePayment);

export default router;