import Unit from "../models/Unit.js";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";




const getUnits = async (req, res) => {
  console.log('getting units');
  const { hoaid, hoaId, role } = req.query;
  const targetHoaId = hoaid || hoaId;
  
  const filter = {};
  if (targetHoaId) {
    filter.hoaid = targetHoaId;
  }
  
  if (role) {
    filter.role = role;
  } else if (targetHoaId && !req.query.all) {
    // Default to owner if hoaid is provided but no specific role or 'all' flag
    // filter.role = 'owner'; 
    // Actually, it's better to NOT hardcode 'owner' if we want to find renters too.
    // But many places might expect only owners.
    // Let's see... if I comment out the hardcoded role, it will return all roles for that HOA.
  }

  const users = await Unit.find(filter).sort({ unitnumber: 1 });
  res.json(users);
};




const getUnit = async (req, res) => {
  console.log('getting units');
  const { hoaid, unitnumber} = req.params;
  let qry = {hoaid:hoaid,unitnumber:unitnumber}
 

  const unit = await Unit.findOne(qry);
  res.json(unit);
};

//  const createUnit = async (req, res) => {
//   try {
//      } catch (error) {
//      res.status(500).json({ message: error.message });
//   }
//  }

const createUnit = async (req, res) => {
  try {
    const { hoaid,
      unitnumber, bedrooms,  pincode, inventory_allowed_owner, parking_allowed_renter,
      parking_allowed_owner, owner_free_parking, renter_free_parking, company } = req.body;

    // const existingEmail = await User.findOne({ email, hoaid });
    // if (existingEmail) {
    //   return res.status(400).json({ message: "Email address already exists for this HOA" });
    // }

    if (unitnumber) {
      const existingUnit = await Unit.findOne({ unitnumber, hoaid });
      if (existingUnit) {
        return res.status(400).json({ message: "Unit number already exists for this HOA" });
      }
    }

    const unit = await Unit.create({
      hoaid,
      unitnumber,
      bedrooms,
      company,
      pincode,
      inventory_allowed_owner,
      parking_allowed_renter,
      parking_allowed_owner,
      owner_free_parking,
      renter_free_parking
    });

    res.status(201).json({
      message: "Unit created successfully",
      unit: {
        _id: unit._id,
        unitnumber: unit.unitnumber,
         hoaid: unit.hoaid
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const createUnit = async (req, res) => {
//   try {
//     const { hoaid,
//       unitnumber, bedrooms,  pincode, inventory_allowed_owner, parking_allowed_renter,
//       parking_allowed_owner, owner_free_parking, renter_free_parking, company } = req.body;
//     const existingEmail = await User.findOne({ email, hoaid });
//     if (existingEmail) {
//       return res.status(400).json({ message: "Email address already exists for this HOA" });
//     }

//     if (unitnumber) {
//       const existingUnit = await User.findOne({ unitnumber, hoaid });
//       if (existingUnit) {
//         return res.status(400).json({ message: "Unit number already exists for this HOA" });
//       }
//     }

//     const user = await User.create({
//       first_name,
//       last_name,
//       phone,
//       email,
//       password,
//       hoaid,
//       unitnumber,
//       bedrooms,
//       role,
//       company,
//       pincode,
//       inventory_allowed_owner,
//       parking_allowed_renter,
//       parking_allowed_owner,
//       owner_free_parking,
//       renter_free_parking
//     });

//     res.status(201).json({
//       message: "User created successfully",
//       user: {
//         _id: user._id,
//         first_name: user.first_name,
//         last_name: user.last_name,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,
//         unitnumber: user.unitnumber
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };




const updateUnit = async (req, res) => {
  try {
  //  const { id } = req.params;
    const { hoaid, unitnumber, bedrooms,  company,
      pincode, inventory_allowed_owner, parking_allowed_renter,
      parking_allowed_owner, owner_free_parking, renter_free_parking } = req.body;
   //console.log("updateUnit body:", req.body);
   let qry = {hoaid:hoaid,unitnumber:unitnumber}
  //console.log('update unit query is ',qry)
 

    const unit = await Unit.findOne(qry);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

  // console.log('got to here updateUnit', unit)

    // if (unitnumber !== undefined && unitnumber !== user.unitnumber) {
    //   const existingUnit = await User.findOne({ unitnumber, hoaid: user.hoaid, _id: { $ne: id } });
    //   if (existingUnit) {
    //     return res.status(400).json({ message: "Unit number already exists for this HOA" });
    //   }
    // }

    // if (first_name !== undefined) user.first_name = first_name;
    // if (last_name !== undefined) user.last_name = last_name;
    // if (phone !== undefined) user.phone = phone;
    // if (email !== undefined) user.email = email;
    if (unitnumber !== undefined) unit.unitnumber = unitnumber;
    if (bedrooms !== undefined) unit.bedrooms = bedrooms;
    if (company !== undefined) unit.company = company;
    if (pincode !== undefined) unit.pincode = pincode;
    //  if (is_verified !== undefined) user.is_verified = is_verified;
    //  if (has_read_terms !== undefined) user.has_read_terms = has_read_terms;
    if (inventory_allowed_owner !== undefined) unit.inventory_allowed_owner = inventory_allowed_owner;
    if (parking_allowed_renter !== undefined) unit.parking_allowed_renter = parking_allowed_renter;
    if (parking_allowed_owner !== undefined) unit.parking_allowed_owner = parking_allowed_owner;
    if (owner_free_parking !== undefined) unit.owner_free_parking = owner_free_parking;
    if (renter_free_parking !== undefined) unit.renter_free_parking = renter_free_parking;

    await unit.save(); 

    res.json({
      message: "Unit has been updated successfully",
      unit: {
        inventory_allowed_owner: unit.inventory_allowed_owner,
        pincode: unit.pincode,
        hoaid: unit.hoaid,
        unitnumber: unit.unitnumber,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "User deleted successfully",
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateAllUnits = async (req, res) => {
  try {
    const { owner_free_parking, renter_free_parking, inventory_allowed_owner, parking_allowed_renter, parking_allowed_owner, hoaid,unitnumber } = req.body;

    if (!hoaid) {
      return res.status(400).json({ message: "HOA ID is required" });
    }

    const updateFields = {};
    if (owner_free_parking !== undefined && owner_free_parking !== "" && owner_free_parking !== null) {
      updateFields.owner_free_parking = parseInt(owner_free_parking);
    }
    if (renter_free_parking !== undefined && renter_free_parking !== "" && renter_free_parking !== null) {
      updateFields.renter_free_parking = parseInt(renter_free_parking);
    }
    if (inventory_allowed_owner !== undefined && inventory_allowed_owner !== "" && inventory_allowed_owner !== null) {
      updateFields.inventory_allowed_owner = parseInt(inventory_allowed_owner);
    }
    if (parking_allowed_renter !== undefined && parking_allowed_renter !== "" && parking_allowed_renter !== null) {
      updateFields.parking_allowed_renter = parseInt(parking_allowed_renter);
    }
    if (parking_allowed_owner !== undefined && parking_allowed_owner !== "" && parking_allowed_owner !== null) {
      updateFields.parking_allowed_owner = parseInt(parking_allowed_owner);
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

  //  console.log('updateFields',updateFields);

    const result = await Unit.updateMany({ hoaid }, { $set: updateFields });

    res.json({
      message: `Successfully updated ${result.modifiedCount} units`,
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export {
  getUnits,  createUnit, deleteUnit,updateUnit,getUnit,updateAllUnits
}