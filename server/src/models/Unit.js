import mongoose from "mongoose";

const unitSchema = new mongoose.Schema({
  unitid: {
    type: ObjectId,
    required: true,
    default: null
  },

  hoaid: {
    type: String,
    required: true
  },

  unitnumber: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    default: ""
  },
  bedrooms: {
    type: Number,
    default: 1
  },

  inventory_allowed_owner: {
    type: Number,
    default: 8
  },

  parking_allowed_owner: {
    type: Number,
    default: 5
  },
  owner_free_parking: {
    type: Number,
    default: 5
  },

  parking_allowed_renter: {
    type: Number,
    default: 2
  },
  renter_free_parking: {
    type: Number,
    default: 2
  },


  company: {
    type: String,
    default: ""
  },
  company_id: {
    type: String,
    default: ""
  },

  status_flag: {
    type: Number, default: 1
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });


const User = mongoose.model("User", userSchema);

export default User;
