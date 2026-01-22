import User from "../models/User.js";
import Payment from "../models/Payment.js";
import jwt from "jsonwebtoken";
import { squareClient } from "../config/square.js";
import { stripe } from "../config/stripe.js";
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
    const { 
      hoaid, vehicleId, checkin, checkout, unitnumber, lastname, firstname, plate, plate_state, make, model, year,
      numdays, pricePerNight, totalAmount, 
      sq_paymentId, sq_amount, sq_cardLastFour, sq_paymentDate,
      stripePaymentIntentId, stripeAmount, stripeCardLastFour, stripePaymentDate
    } = req.body.state;

    if (!hoaid || !vehicleId || !unitnumber || !lastname || !firstname || !plate) {
      return res.status(400).json({ message: "Missing required payment fields" });
    }

    const paymentData = {
      hoaid,
      vehicleId,
      numdays,
      pricePerNight,
      unitnumber,
      firstname,
      lastname,
      plate,
      status: "completed"
    };

    if (sq_paymentId) {
      paymentData.sq_paymentId = sq_paymentId;
      paymentData.sq_amount = sq_amount;
      paymentData.sq_cardLastFour = sq_cardLastFour;
      paymentData.sq_paymentDate = new Date(sq_paymentDate);
    } else if (stripePaymentIntentId) {
      paymentData.stripePaymentIntentId = stripePaymentIntentId;
      paymentData.stripeAmount = stripeAmount;
      paymentData.stripeCardLastFour = stripeCardLastFour;
      paymentData.stripePaymentDate = new Date(stripePaymentDate);
    } else {
      return res.status(400).json({ message: "No payment ID provided (Square or Stripe)" });
    }

    const payment = await Payment.create(paymentData);

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

const createStripePaymentIntent = async (req, res) => {
  try {
    const { amount, metadata } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }
    console.log('createStripePaymentIntent metadata is',metadata)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: metadata || {}
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error("Error creating Stripe PaymentIntent:", error);
    res.status(500).json({ message: error.message || "Error creating PaymentIntent" });
  }
};

// this is never called
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
    console.log('TRYING TO SEND A PAYMENT IDEMPOTENCY KEY TO SQUARE ',idempotencyKey)
    console.log('TRYING TO SEND A PAYMENT TOKEN TO SQUARE ',token);
     console.log('TRYING TO SEND A PAYMENT LOCATION ID TO SQUARE ',process.env.SQUARE_LOCATION_ID);
     console.log('TRYING TO SEND A PAYMENT ACCESS TOKEN TO SQUARE ',process.env.SQUARE_ACCESS_TOKEN)
    const response = await squareClient.payments.create({
      sourceId: token,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(Math.round(amount)),
        currency: "USD"
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      note: parkingSessionId ? `Parking session ${parkingSessionId}` : "Parking payment"
    });

   

    res.json({
      success: true,
      payment: convertBigInt(response.payment)
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
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      
      // Filter by either Square or Stripe payment date
      filter.$or = [
        { sq_paymentDate: dateFilter },
        { stripePaymentDate: dateFilter }
      ];
    }

    const payments = await Payment.find(filter).sort({ createdAt: -1 });
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
    const refundAmountCents =  Math.round(refundAmount * 100);

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const originalAmount = payment.sq_amount || payment.stripeAmount || 0;
    const totalRefunded = payment.totalRefunded || 0;
    const availableToRefund = originalAmount - totalRefunded;
    
    if (refundAmountCents > availableToRefund) {
      return res.status(400).json({ 
        message: `Refund amount cannot exceed available amount. Available: $${((originalAmount - totalRefunded) / 100).toFixed(2)}, Requested: $${refundAmount.toFixed(2)}` 
      });
    }

    if (payment.stripePaymentIntentId) {
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: refundAmountCents,
        reason: 'requested_by_customer',
        metadata: {
          reason: refundReason || "Partial refund issued"
        }
      });
      payment.stripeRefundId = refund.id;
    } else if (payment.sq_paymentId) {
      // Square refund logic if needed, but it was commented out
      // Keeping it as a placeholder or you can implement it
    }

    let newStatus = "partial_refund";
    const newTotalRefunded = totalRefunded + refundAmountCents;
    if (newTotalRefunded >= originalAmount) {
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
      payment: payment
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({ message: error.message || "Error processing refund" });
  }
};

export { recordParkingPayment, processSquarePayment, getPayments, processRefund, createStripePaymentIntent };

