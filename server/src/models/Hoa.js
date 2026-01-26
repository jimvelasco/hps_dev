import mongoose from "mongoose";



// Create Schema

const HoaSchema = new mongoose.Schema({
 hoaid: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zip: {
    type: String
  },

  parking_allowed_hoa: {
    type: Number,
    default: 50
  },
  /* not used */
  // parking_allowed_unit: {
  //   type: Number,
  //   default: 3
  // },
  inventory_allowed_owner: {
    type: Number,
    default: 5
  },
  parking_allowed_renter: {
    type: Number,
    default: 2
  },
   parking_allowed_owner: {
    type: Number,
    default: 2
  },

  renter_free_parking_spots: {
    type: Number,
    default: 1
  },
  owner_free_parking_spots: {
    type: Number,
    default: 5
  },
  // season_adjust_unit: {
  //   type: Number,
  //   default: 0
  // },
  // season_adjust_renter: {
  //   type: Number,
  //   default: 0
  // },
  // season_parking_fee_factor: {
  //   type: Number,
  //   default: 1
  // },
  // use_availability_factor: {
  //   type: String,
  //   default: "false"
  // },

  // use_owner_creditcard: {
  //   type: Number,
  //   default: 0
  // },
  // use_renter_creditcard: {
  //   type: Number,
  //   default: 0
  // },

  // use_owner_ppp: {
  //   type: Number,
  //   default: 0
  // },
  // use_renter_ppp: {
  //   type: Number,
  //   default: 0
  // },
  // use_warning_status: {
  //   type: Number,
  //   default: 0
  // },

  // availability_warning_buffer: {
  //   type: Number,
  //   default: 0
  // },

  

  company: {
    type: String
  },
  company_id: {
    type: String
  },
  // hoa_phone_office: {
  //   type: String
  // },
  // hoa_phone_cell: {
  //   type: String
  // },
  // hoa_email: {
  //   type: String
  // },
  // pm_phone_office: {
  //   type: String
  // },
  // pm_phone_cell: {
  //   type: String
  // },
  // pm_email: {
  //   type: String
  // },
  // webmaster_email: {
  //   type: String
  // },

  background_image_url: {
    type: String
  },
  parking_information_url: {
    type: String
  },
  status_flag: {
    type: Number, default: 1
  },

   commission_percent: {
    type: Number, default: 15
  },
  
  stripeAccountId: {
    type: String
  },
  stripeOnboardingComplete: {
    type: Boolean,
    default: false
  },

  payment_ranges: [
    {
      startDayMo: { type: String },
      endDayMo: { type: String },
      rate: { type: Number },
      description: { type: String }
    }
  ],

  contact_information: [
    {
      contact_id: { type: String },
      phone_number: { type: String },
      phone_description: { type: String },
      email: { type: String },
      display_category: { type: String },
    }
  ],
  help_text: {
    general: { type: String },
    permissions: { type: String },
    owner: { type: String },
    owner_tc: { type: String },
    renter: { type: String },
    renter_tc: { type: String },
    other: { type: String }
  },
  date: {
    type: Date,
    default: Date.now
  }
},{ timestamps: true });

const Hoa = mongoose.model("Hoa", HoaSchema);


export default Hoa;

