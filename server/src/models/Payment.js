import mongoose from "mongoose";

const ObjectId = mongoose.Schema.Types.ObjectId;

const paymentSchema = new mongoose.Schema(
  {
    hoaid: {
      type: String,
      required: true,
      index: true
    },
    vehicleId: {
      type: ObjectId,
      ref: "Vehicle",
      required: true,
      index: true
    },
    stripePaymentIntentId: {
      type: String,
      unique: true,
      index: true,
      sparse: true
    },
    stripeRefundId: {
      type: String,
      unique: true,
      index: true,
      sparse: true
    },
    stripeAmount: {
      type: Number
    },
    stripeCardLastFour: {
      type: String
    },
    stripePaymentDate: {
      type: Date
    },
    numdays: {
      type: Number,
      required: true
    },
    pricePerNight: {
      type: Number,
      required: true
    },
    unitnumber: {
      type: String,
      required: true,
      index: true
    },
    firstname: {
      type: String,
      required: true,
      index: true
    },
    lastname: {
      type: String,
      required: true,
      index: true
    },
    plate: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["completed", "refunded", "partial_refund"],
      default: "completed"
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    totalRefunded: {
      type: Number,
      default: 0
    },
    refundDate: {
      type: Date,
      default: null
    },
    refundReason: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
