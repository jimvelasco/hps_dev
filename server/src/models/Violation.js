const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;


// Create Schema

const ViolationSchema = new Schema({
  // _id: {
  //   type: ObjectId
  // },


  violation_plate: {
    type: String,
    required: true
  },
  violation_state: {
    type: String,
    required: true
  },
  violation_location: {
    type: String,
    required: true
  },
  violation_description: {
    type: String
  },
  violation_type: {
    type: String,
    required: true
  },
  violation_reporter: {
    type: String
  },
  violation_date: {
    type: String,
    required: true
  },
  violation_time: {
    type: String,
    required: true
  },

  hoaid: {
    type: String
  },
  status_flag: {
    type: Number, default: 1
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Violation = mongoose.model("violations", ViolationSchema);
