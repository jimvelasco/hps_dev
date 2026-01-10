import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { squareClient } from "../config/square.js";
import crypto from "crypto";

const convertBigInt = (obj) => {
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigInt);
  }
  if (obj !== null && typeof obj === "object") {
    const result = {};
    for (const key in obj) {
      result[key] = convertBigInt(obj[key]);
    }
    return result;
  }
  return obj;
};

const makeParkingPayment = async (req, res) => {
 
  const {  vehicleId,checkin,checkout } = req.body.state;
// console.log('makeParkingPayment',vehicleId,checkin,checkout);
  // const filter = hoaId ? { hoaid:hoaId } : {};
  //  console.log("getUsers and hoaId:", hoaId,filter);
  // const users = await User.find(filter);
  const rval = { message: "Parking payment recorded successfully" };
  res.json(rval);
};

const processSquarePayment = async (req, res) => {
  try {
    const { token, amount, parkingSessionId } = req.body;

    //console.log('TRYING TO SEND A PAYMENT TO SQUARE   ')

    if (!token || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: token and amount"
      });
    }

    const idempotencyKey = crypto.randomUUID();
    // console.log('TRYING TO SEND A PAYMENT IDEMPOTENCY KEY TO SQUARE ',idempotencyKey)
    // console.log('TRYING TO SEND A PAYMENT TOKEN TO SQUARE ',token);
    //  console.log('TRYING TO SEND A PAYMENT LOCATION ID TO SQUARE ',process.env.SQUARE_LOCATION_ID);
    //  console.log('TRYING TO SEND A PAYMENT ACCESS TOKEN TO SQUARE ',process.env.SQUARE_ACCESS_TOKEN)
    const response = await squareClient.paymentsApi.createPayment({
      sourceId: token,
      idempotencyKey,
      amountMoney: {
        amount: Math.round(amount),
        currency: "USD"
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      note: parkingSessionId ? `Parking session ${parkingSessionId}` : "Parking payment"
    });

    res.json({
      success: true,
      payment: convertBigInt(response.result.payment)
    });
  } catch (err) {
    console.error("[SQUARE ERROR]", err);
    res.status(500).json({
      success: false,
      message: err.message || "Payment processing failed"
    });
  }
};

export { makeParkingPayment, processSquarePayment };

