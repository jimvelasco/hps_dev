import mongoose from "mongoose";

const unitSchema = new mongoose.Schema({

  hoaid: {
    type: String,
    required: true
  },

  unitnumber: {
    type: String,
    required: true
  },
  // pincode: {
  //   type: String,
  //   default: ""
  // },


  pincodeary: [
    {
      pincode: { type: String },
      action: { type: String },
      description: { type: String },
      expire_date: { type: String },
      uses_allowed: { type: Number, default: 0 },
      uses_used: { type: Number, default: -1 },
      expire_date: { type: String }
    }
  ],
  bedrooms: {
    type: Number,
    default: 2
  },

  inventory_allowed_owner: {
    type: Number,
    default: 8
  },
/* not used anywhere but left in for legacy records */
  parking_allowed_unit: {
    type: Number,
    default: 2
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


  // daypasses_allowed_owner: 1,
  //       parking_allowed_tenant: 2,
  //       tenant_free_parking_spots: 2,
  //       daypasses_allowed_tenant: 0,
  //       daypasses_allowed_renter: 0


  daypasses_allowed_owner: {
    type: Number,
    default: 1
  },
  parking_allowed_tenant: {
    type: Number,
    default: 2
  },
  tenant_free_parking_spots: {
    type: Number,
    default: 2
  },
  daypasses_allowed_tenant: {
    type: Number,
    default: 0
  },
  daypasses_allowed_renter: {
    type: Number,
    default: 0
  },
  day_use_only: {
     type: Number, default: 0
  },


  available_for_rent: {
    type: Number,
    default: 1
  },
  is_resident: {
    type: Number,
    default: 0
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


const Unit = mongoose.model("Unit", unitSchema);

export default Unit;
