import User from "../models/User.js";
import Payment from "../models/Payment.js";
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
            pricePerNight:pricePerNight,
            totalAmount:totalAmount,
            sq_paymentId:paymentId,
            sq_amount:amount,
            sq_cardLastFour:cardLastFour,
            sq_paymentDate:paymentDate
*/

const recordParkingPayment = async (req, res) => {
  try {
  //  console.log("SERVER recordParkingPayment", req.body);

    const { hoaid, vehicleId, checkin, checkout, unitnumber, lastname, firstname, plate, plate_state, make, model, year,
      amountInCents, numdays, pricePerNight, totalAmount, sq_paymentId, sq_amount, sq_cardLastFour, sq_paymentDate } = req.body.state;

    if (!hoaid || !vehicleId || !sq_paymentId || !sq_amount || !unitnumber || !lastname || !firstname || !plate) {
      return res.status(400).json({ message: "Missing required payment fields" });
    }
  //  console.log("SERVER STATE recordParkingPayment", req.body.state);
    const payment = await Payment.create({
      hoaid,
      vehicleId,
      sq_paymentId,
      sq_amount,
      sq_cardLastFour,
      sq_paymentDate: new Date(sq_paymentDate),
      numdays,
      pricePerNight,
      unitnumber,
      firstname,
      lastname,
      plate,
      status: "completed"
    });

    const rval = { 
      message: "Parking payment recorded successfully",
      payment: payment
    };
    res.json(rval);
  } catch (error) {
    console.error("Error recording parking payment:", error);
    res.status(500).json({ message: error.message || "Error recording payment" });
  }
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

const getPayments = async (req, res) => {
  try {
    const { hoaid, unitnumber, plate, firstname, lastname, startDate, endDate } = req.query;

    const filter = {};
    if (hoaid) filter.hoaid = hoaid;
    if (unitnumber) filter.unitnumber = unitnumber;
    if (plate) filter.plate = plate;
    if (firstname) filter.firstname = new RegExp(firstname, "i");
    if (lastname) filter.lastname = new RegExp(lastname, "i");
    
    if (startDate || endDate) {
      filter.sq_paymentDate = {};
      if (startDate) filter.sq_paymentDate.$gte = new Date(startDate);
      if (endDate) filter.sq_paymentDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter).sort({ sq_paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: error.message || "Error fetching payments" });
  }
};

const processRefund = async (req, res) => {
  try {
    const { paymentId, refundAmount, refundReason } = req.body;

    if (!paymentId || !refundAmount) {
      return res.status(400).json({ message: "Payment ID and refund amount are required" });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const refundAmountCents = Math.round(refundAmount * 100);
    
    const totalRefunded = payment.totalRefunded || 0;
    const availableToRefund = payment.sq_amount - totalRefunded;
    
    if (refundAmountCents > availableToRefund) {
      return res.status(400).json({ 
        message: `Refund amount cannot exceed available amount. Available: $${(availableToRefund / 100).toFixed(2)}, Requested: $${refundAmount.toFixed(2)}` 
      });
    }

    const idempotencyKey = crypto.randomUUID();
    const squareRefund = await squareClient.refundsApi.refundPayment({
      idempotencyKey,
      paymentId: payment.sq_paymentId,
      amountMoney: {
        amount: refundAmountCents,
        currency: "USD"
      },
      reason: refundReason || "Partial refund issued"
    });

    let newStatus = "partial_refund";
    const newTotalRefunded = totalRefunded + refundAmountCents;
    if (newTotalRefunded === payment.sq_amount) {
      newStatus = "refunded";
    }

    payment.status = newStatus;
    payment.refundAmount = refundAmountCents;
    payment.totalRefunded = newTotalRefunded;
    payment.refundDate = new Date();
    payment.refundReason = refundReason;
    await payment.save();

    res.json({
      message: "Refund processed successfully",
      refund: convertBigInt(squareRefund.result.refund),
      payment: payment
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    const errorMessage = error.errors?.[0]?.detail || error.message || "Error processing refund";
    res.status(500).json({ message: errorMessage });
  }
};

export { recordParkingPayment, processSquarePayment, getPayments, processRefund };

