import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const vehicleSchema = new mongoose.Schema(
  {
    ownerid: {
    type: ObjectId,
    required: false,
    default: null
    
  },

  unitnumber: {
    type: String
  },
  carownertype: {
    type: String
  },
  carownername: {
    type: String,

  },
  carowner_fname: {
    type: String,
    required: true
  },
  carowner_lname: {
    type: String,
    required: true
  },
  carownerphone: {
    type: String,
    required: true
  },


  make: {
    type: String,
    required: true
  },
  model: {
    type: String
  },
  year: {
    type: String

  },
  vehicle_type: {
    type: String

  },
  plate: {
    type: String,
    required: true
  },
  plate_state: {
    type: String

  },
  hoaid: {
    type: String,
    required: true
  },

  // active_flag: {
  //   type: Number, default: 0
  // },

  status_flag: {
    type: Number, default: 1
  },
  requires_payment: {
    type: Number, default: 0
  },
  // number_of_changes: {
  //   type: Number, default: 0
  // },
  has_read_terms: {
    type: Number, default: 0
  },
  enddate: {
    type: String
  },

  startdate: {
    type: String
  },

  checkout: {
    type: Date,
    default: Date.now
  },
  checkin: {
    type: Date,
    default: Date.now
  },


  // change_history: {
  //   type: Array,
  //   default: []
  //   },
}, {timestamps: true});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;