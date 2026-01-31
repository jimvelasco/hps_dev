import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
 name: {
    type: String

  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  unitnumber: {
    type: String
  },
  bedrooms: {
    type: Number
  },
  // /* not used */
  // parking_allowed: {
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
  owner_free_parking: {
    type: Number,
    default: 5
  },
  renter_free_parking: {
    type: Number,
    default: 1
  },
  role: {
    type: String,
    default: ""
  },
  // crud: {
  //   type: String,
  //   default: ""
  // },
  pincode: {
    type: String,
    default: ""
  },
  hoaid: {
    type: String,
    required: true
  },
  company: {
    type: String,
    default: ""
  },
  company_id: {
    type: String,
    default: ""
  },
  enterprise_id: {
    type: String,
    default: ""
  },

  status_flag: {
    type: Number, default: 1
  },
  // is_verified: {
  //   type: Number, default: 0
  // },
  // has_read_terms: {
  //   type: Number, default: 0
  // },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
