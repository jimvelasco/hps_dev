import mongoose from "mongoose";

const ObjectId = mongoose.Schema.Types.ObjectId;

const hpsrecordSchema = new mongoose.Schema(
    {
        hoaid: {
            type: String,
            required: true,
            index: true
        },
        vehicleId: {
            type: ObjectId,
            ref: "Vehicle",
            required: true
        },
        ownerId: {
            type: ObjectId,
            ref: "User",
            required: true
        },

        unitnumber: {
            type: String,
            required: true
        },
        ownertype: {
            type: String,
            required: true
        },

        firstname: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        },
        phone: {
            type: String
        },
        plate: {
            type: String,
            required: true
        },
        platestate: {
            type: String,
            required: true
        },
        requires_payment: {  //0 free, 1 paynow, 2 paid
            type: Number, default: 0
        },
        original_enddate: {
            type: String
        },
        original_startdate: {
            type: String
        },
        enddate: {
            type: String
        },
        startdate: {
            type: String
        },
    },
    { timestamps: true }
);

const HPSRecord = mongoose.model("HPSRecord", hpsrecordSchema);

export default HPSRecord;
