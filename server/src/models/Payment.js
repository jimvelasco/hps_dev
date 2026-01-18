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
    sq_paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    sq_amount: {
      type: Number,
      required: true
    },
    sq_cardLastFour: {
      type: String,
      required: true
    },
    sq_paymentDate: {
      type: Date,
      required: true
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
