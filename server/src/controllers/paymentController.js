import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Hoa from "../models/Hoa.js";
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
      hoaid, vehicleId, checkin, checkout, unitnumber, lastname, firstname, plate, plate_state, 
      make, model, year,
      numdays, pricePerNight, totalAmount, 
      stripePaymentIntentId, stripeAmount, stripeCardLastFour, stripePaymentDate
    } = req.body.state;

    if (!hoaid || !vehicleId || !unitnumber || !lastname || !firstname || !plate) {
      return res.status(400).json({ message: "Missing required payment fields" });
    }

    if (!stripePaymentIntentId) {
      return res.status(400).json({ message: "No payment ID provided (Stripe)" });
    }

    let finalCardLastFour = stripeCardLastFour;
    // Try to get actual last 4 digits from Stripe if not provided or hardcoded
    if (stripePaymentIntentId && (!finalCardLastFour || finalCardLastFour === 'xxxx')) {
      try {
        const pi = await stripe.paymentIntents.retrieve(stripePaymentIntentId, {
          expand: ['payment_method']
        });
        if (pi.payment_method && pi.payment_method.card) {
          finalCardLastFour = pi.payment_method.card.last4;
        }
      } catch (e) {
        console.error("Error fetching payment method details:", e);
      }
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
      stripeCardLastFour: finalCardLastFour,
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
   // console.log('createStripePaymentIntent metadata is', metadata)

    const amountInCents = Math.round(amount);
    
    // Create the payment intent object
    const paymentIntentParams = {
      amount: amountInCents,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: metadata || {}
    };

    // If an HOA ID is provided, try to find the HOA and their Stripe account
    if (metadata && metadata.hoaId) {
      const hoa = await Hoa.findOne({ hoaid: metadata.hoaId });
      
      if (hoa && hoa.stripeAccountId && hoa.stripeOnboardingComplete) {
      //  console.log('the hoa is',hoa);
        const commissionPercent = hoa.commission_percent/100;

        try {
          // Double check with Stripe that the account is ready for transfers
          const account = await stripe.accounts.retrieve(hoa.stripeAccountId);
          const transfersActive = account.capabilities && account.capabilities.transfers === 'active';

          if (transfersActive) {
            // Destination charges: The charge is created on the platform, 
            // and then the funds (minus the fee) are transferred to the HOA.
            
            // Calculate 10% application fee
           // const applicationFee = Math.round(amountInCents * 0.10);
             const applicationFee = Math.round(amountInCents * commissionPercent);
           //  console.log('applicationFee is',applicationFee,'commissionPercent is',commissionPercent,'amountInCents is',amountInCents);
            
            paymentIntentParams.application_fee_amount = applicationFee;
            paymentIntentParams.transfer_data = {
              destination: hoa.stripeAccountId
            };
            
            console.log(`Setting up destination charge for HOA: ${hoa.name} (${hoa.stripeAccountId}) with fee: ${applicationFee}`);
          } else {
            console.warn(`HOA ${hoa.name} has stripeOnboardingComplete=true but transfers capability is ${account.capabilities?.transfers || 'missing'}. Falling back to platform charge.`);
            // Optionally update our record
            hoa.stripeOnboardingComplete = false;
            await hoa.save();
          }
        } catch (accountError) {
          console.error(`Error verifying Stripe account ${hoa.stripeAccountId} for HOA ${hoa.name}:`, accountError);
          // Fall back to platform charge if we can't verify the account
        }
      }
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error("Error creating Stripe PaymentIntent:", error);
    if (error.raw) {
      console.error("Stripe Raw Error:", JSON.stringify(error.raw, null, 2));
    }
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
      // Retrieve the payment intent to check if it was a destination charge
      const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
      
      const refundParams = {
        payment_intent: payment.stripePaymentIntentId,
        amount: refundAmountCents,
        reason: 'requested_by_customer',
        metadata: {
          reason: refundReason || "Partial refund issued"
        }
      };

      // If it was a destination charge, reverse the transfer from the connected account
      // and refund the application fee proportional to the refund amount
      if (paymentIntent.transfer_data && paymentIntent.transfer_data.destination) {
        refundParams.reverse_transfer = true;
        refundParams.refund_application_fee = true;
        console.log(`Processing refund with reverse_transfer for destination charge: ${payment.stripePaymentIntentId}`);
      }

      const refund = await stripe.refunds.create(refundParams);
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

