const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const ObjectId = mongoose.Schema.Types.ObjectId;


// Create Schema

const notificationSchema = new mongoose.Schema({
  // _id: {
  //   type: ObjectId
  // },

  notify_type: {
    type: String,
    required: true
  },
  notify_name: {
    type: String
  },
  notify_phone: {
    type: String
  },
  notify_unit: {
    type: String
  },
  notify_plate: {
    type: String
  },
  notify_description: {
    type: String,
    required: true
  },

  notify_date: {
    type: String,
    required: true
  },
  notify_time: {
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
}, {timestamps: true});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;


