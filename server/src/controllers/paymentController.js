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

/*
 state: {
            hoaid: hoa.hoaid,
            vehicleId: vehicleId,
            checkin: vehicle.checkin,
            checkout: vehicle.checkout,
            unitnumber: vehicle.unitnumber,
            lastname: vehicle.carowner_lname,
            firstname: vehicle.carowner_fname,
            plate: vehicle.plate,
            plate_state: vehicle.plate_state,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            amountInCents:amountInCents,
            numdays:numdays,
            sq_paymentId:paymentId,
            sq_amount:amount,
            sq_cardLastFour:cardLastFour,
            sq_paymentDate:paymentDate
*/

const recordParkingPayment = async (req, res) => {
  console.log("SERVER recordParkingPayment", req.body);

  const { hoaid,vehicleId, checkin, checkout,unitnumber,lastname,firstname,plate,plate_state,make,model,year,
    amountInCents,numdays,sq_paymentId,sq_amount,sq_cardLastFour,sq_paymentDate } = req.body.state;

 //console.log("SERVER STATE recordParkingPayment", req.body.state);
  const rval = { message: "Parking payment recorded successfully" };
  res.json(rval);
};

const processSquarePayment = async (req, res) => {
  try {
    const { token, amount, parkingSessionId } = req.body;

    console.log('**************************************************************************************')
    console.log('TRYING TO SEND A PAYMENT TO SQUARE token=', token, 'amount=', amount, 'parkingSessionId=', parkingSessionId, '********')
    console.log('***************************************************************************************')

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

export { recordParkingPayment, processSquarePayment };

