import mongoose from "mongoose";



// Create Schema

const TestModelSchema = new mongoose.Schema({
 tempid: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  startdate: {
    type: String,
    required: true
  },
   checkin: {
    type: Date,
    default: Date.now
   },
   checkin2: {
    type: Date,
    default: Date.now
   },
    checkin3: {
    type: Date,
    default: Date.now
   },
  
  }, {timestamps: true});

  const TestModel = mongoose.model("TestModel", TestModelSchema);

  export default TestModel;