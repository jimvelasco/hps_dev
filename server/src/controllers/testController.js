import { mongo } from "mongoose";
import TestModel from "../models/TestModel.js";
import Vehicle from "../models/Vehicle.js";

const createTestModel = async (req, res) => {
    const d = new Date();
    const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const mongoDateStr = `${y}-${m}-${day}`; // "YYYY-MM-DD"

  let sdate = new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD"
  sdate = sdate + 'T00:00:00.000Z';


const start = new Date(Date.UTC(2025, 11, 26));
 const end   = new Date(Date.UTC(2025, 11, 27));

// console.log("UTC start date:noiso", start);
// console.log("UTC end datenoiso", end);    

// console.log("UTC start date:", start.toISOString());
// console.log("UTC end date:", end.toISOString());    



  console.log("Mongo date string:", mongoDateStr);
  try {
    const theData = {
        tempid:"one", 
        name:"Test Name", 
        startdate:sdate, 
        checkin: sdate ,
        checkin2: start ,
        checkin3: mongoDateStr
    };
    console.log("server Creating test model with data:", theData);

    const tm = await TestModel.create(theData);

    res.status(201).json(tm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getModels = async (req, res) => {
  try {
    const tests = await TestModel.find();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getModelsByStart = async (req, res) => {
  try {
    //const { startd} = req.params;
    //  const startd = "2025-12-28";
     const startd = "2021-11-27";
    console.log("Fetching models with startdate:", startd);
    const qry = { checkin: startd };
    //  const model = await TestModel.find(qry);
     const model = await Vehicle.find(qry);
    if (!model) {
      return res.status(404).json({ message: "Model not found" });
    }
    console.log("Fetched model:", model);
    res.json(model);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
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
*/


// const updateHoaById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;
    
//     if (updateData.payment_ranges) {
//       updateData.payment_ranges = updateData.payment_ranges.map(range => ({
//         startDayMo: range.startDayMo,
//         endDayMo: range.endDayMo,
//         rate: range.rate,
//         description: range.description
//       }));
//     }

//     if (updateData.contact_information) {
//       updateData.contact_information = updateData.contact_information.map(contact => ({
//         contact_id: contact.contact_id,
//         phone_number: contact.phone_number,
//         phone_description: contact.phone_description,
//         email: contact.email,
//         display_category: contact.display_category
//       }));
//     }
    
//     const hoa = await Hoa.findOneAndUpdate(
//       { hoaid: id },
//       updateData,
//       { new: true }
//     );
    
//     if (!hoa) {
//       return res.status(404).json({ message: "HOA not found" });
//     }
    
//     res.json(hoa);
//   } catch (error) {
//     console.error("Update HOA error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

export {createTestModel, getModels,getModelsByStart };
