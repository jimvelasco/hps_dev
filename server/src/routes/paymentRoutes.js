import express from "express";
import {makeParkingPayment} from "../controllers/paymentController.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();


//router.post("/", makeParkingPayment);
router.post("/record-parking", makeParkingPayment);


export default router;