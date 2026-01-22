import User from "../models/User.js";
import Payment from "../models/Payment.js";
import jwt from "jsonwebtoken";
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
          numdays: numdays,
          pricePerNight: pricePerNightCents,
          totalAmount: amountInCents,
          stripePaymentIntentId: paymentId,
          stripeAmount: amount,
          stripeCardLastFour: cardLastFour,
          stripePaymentDate: paymentDate
*/

const recordParkingPayment = async (req, res) => {
  try {
    const { 
      hoaid, vehicleId, checkin, checkout, unitnumber, lastname, firstname, plate, plate_state, make, model, year,
      numdays, pricePerNight, totalAmount, 
      stripePaymentIntentId, stripeAmount, stripeCardLastFour, stripePaymentDate
    } = req.body.state;

    if (!hoaid || !vehicleId || !unitnumber || !lastname || !firstname || !plate) {
      return res.status(400).json({ message: "Missing required payment fields" });
    }

    if (!stripePaymentIntentId) {
      return res.status(400).json({ message: "No payment ID provided (Stripe)" });
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
      status: "completed",
      stripePaymentIntentId,
      stripeAmount,
      stripeCardLastFour,
      stripePaymentDate: new Date(stripePaymentDate)
    };

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
      
      filter.stripePaymentDate = dateFilter;
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

    const originalAmount = payment.stripeAmount || 0;
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

export { recordParkingPayment, getPayments, processRefund, createStripePaymentIntent };

