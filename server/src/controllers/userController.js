import User from "../models/User.js";
import jwt from "jsonwebtoken";

const getUsers = async (req, res) => {
 
  const { hoaId } = req.query;
  const filter = hoaId ? { hoaid:hoaId } : {};
 //  console.log("getUsers and hoaId:", hoaId,filter);
  const users = await User.find(filter);
  res.json(users);
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { first_name, last_name, phone, email,  hoaid, 
      unitnumber, bedrooms, role ,password ,pincode,inventory_allowed_owner,parking_allowed_renter,
      parking_allowed_owner,owner_free_parking, renter_free_parking, company} = req.body;

    if (!first_name || !last_name || !phone || !email || !password || !hoaid) {
      return res.status(400).json({ message: "Missing required fields: first_name, last_name, phone, email, password, hoaid" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const user = await User.create({
      first_name,
      last_name,
      phone,
      email,
      password,
      hoaid,
      unitnumber,
      bedrooms,
      role,
      company,
      pincode,
      inventory_allowed_owner,
      parking_allowed_renter,
      parking_allowed_owner,
      owner_free_parking,
      renter_free_parking
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, email, unitnumber, bedrooms, role, company, 
      pincode, password,is_verified, has_read_terms, inventory_allowed_owner, parking_allowed_renter, 
      parking_allowed_owner, owner_free_parking, renter_free_parking } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (phone !== undefined) user.phone = phone;
    if (email !== undefined) user.email = email;
    if (unitnumber !== undefined) user.unitnumber = unitnumber;
    if (bedrooms !== undefined) user.bedrooms = bedrooms;
    if (role !== undefined) user.role = role;
    if (company !== undefined) user.company = company;
    if (pincode !== undefined) user.pincode = pincode;
    if (password !== undefined) user.password = password;
    if (is_verified !== undefined) user.is_verified = is_verified;
    if (has_read_terms !== undefined) user.has_read_terms = has_read_terms;
    if (inventory_allowed_owner !== undefined) user.inventory_allowed_owner = inventory_allowed_owner;
    if (parking_allowed_renter !== undefined) user.parking_allowed_renter = parking_allowed_renter;
    if (parking_allowed_owner !== undefined) user.parking_allowed_owner = parking_allowed_owner;
    if (owner_free_parking !== undefined) user.owner_free_parking = owner_free_parking;
    if (renter_free_parking !== undefined) user.renter_free_parking = renter_free_parking;

    await user.save();  // we use save because the model has a pre-save hook to hash password

    res.json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
  //  console.log("loginUser called with email:", req.body);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
// we need to implement this.  the comparePassword method is  in User model
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        hoaId: user.hoaid
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        email: user.email,
        unitnumber: user.unitnumber,
        bedrooms: user.bedrooms,
        role: user.role,
        pincode: user.pincode,
        is_verified: user.is_verified,
        has_read_terms: user.has_read_terms,
        inventory_allowed_owner: user.inventory_allowed_owner,
        parking_allowed_renter: user.parking_allowed_renter,
        parking_allowed_owner: user.parking_allowed_owner,
        owner_free_parking: user.owner_free_parking,
        renter_free_parking: user.renter_free_parking
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
   // console.log("getCurrentUser userId:", req.user.userId, "user:", user);
 console.log("getCurrentUser userId:", req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      email: user.email,
      unitnumber: user.unitnumber,
      bedrooms: user.bedrooms,
      role: user.role,
      pincode: user.pincode,
      is_verified: user.is_verified,
      has_read_terms: user.has_read_terms,
      inventory_allowed_owner: user.inventory_allowed_owner,
      parking_allowed_renter: user.parking_allowed_renter,
      parking_allowed_owner: user.parking_allowed_owner,
      owner_free_parking: user.owner_free_parking,
      renter_free_parking: user.renter_free_parking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyRenterPin = async (req, res) => {
  try {
    const { hoaId, unitNumber, pinCode } = req.body;

    if (!hoaId || !unitNumber || !pinCode) {
      return res.status(400).json({ 
        message: "Missing required fields: hoaId, unitNumber, pinCode" 
      });
    }

    const user = await User.findOne({ 
      hoaid: hoaId, 
      unitnumber: unitNumber, 
      pincode: pinCode 
    });

    if (!user) {
      return res.status(401).json({ 
        message: "Invalid unit number or PIN" 
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: "renter" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        unitnumber: user.unitnumber,
        role: "renter"
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getUsers, getUserById, createUser, updateUser, loginUser, getCurrentUser, verifyRenterPin };


