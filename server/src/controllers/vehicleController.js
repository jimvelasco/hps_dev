import Vehicle from "../models/Vehicle.js";
import HPSRecord from "../models/HPSRecord.js";

const logHPSRecord = async (vehicle, oldStartDate = null, oldEndDate = null) => {
  try {
    await HPSRecord.create({
      hoaid: vehicle.hoaid,
      vehicleId: vehicle._id,
      ownerId: vehicle.ownerid,
      unitnumber: vehicle.unitnumber,
      ownertype: vehicle.carownertype,
      firstname: vehicle.carowner_fname,
      lastname: vehicle.carowner_lname,
      phone: vehicle.carownerphone,
      plate: vehicle.plate,
      platestate: vehicle.plate_state,
      requires_payment: vehicle.requires_payment,
      original_startdate: oldStartDate || vehicle.startdate,
      original_enddate: oldEndDate || vehicle.enddate,
      startdate: vehicle.startdate,
      enddate: vehicle.enddate
    });
  } catch (error) {
    console.error("Failed to log HPSRecord:", error);
  }
};

const getVehiclesByHoaId = async (req, res) => {
  try {
    const { hoaId } = req.params;
    const { filter } = req.query;

    //   console.log("getVehiclesByHoaId Filter received params:", req.params);

    const qry = { hoaid: hoaId };
   //   console.log("getVehiclesByHoaId Filter received:", filter,qry);

    // if (filter === "owner") {
    //   qry.carownertype = "owner";
    // } else if (filter === "renter") {
    //   qry.carownertype = "renter";
    // }

    //  qry.carownertype = "owner";

    const vehicles = await Vehicle.find(qry);
      //console.log("getVehiclesByHoaId reponse size is:", vehicles.length);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVehiclesByHoaIdOwner = async (req, res) => {
  try {
    const { hoaId, role } = req.params;
    // const { filter } = req.query;

    const qry = { hoaid: hoaId };
    //console.log("Filter received:", filter);
    //  console.log("getVehiclesByHoaIdOwner role received:", role,req.params);

    // if (filter === "owner") {
    //   qry.carownertype = "owner";
    // } else if (filter === "renter") {
    //   qry.carownertype = "renter";
    // }

    //  qry.carownertype = "owner";

    const vehicles = await Vehicle.find(qry);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVehiclesByHoaIdOwnerId = async (req, res) => {
  try {
    let { hoaId, role, ownerid } = req.params;
    let { filter } = req.query;
    //  console.log("getVehiclesByHoaIdOwnerId role received params:",  req.params);
    //   console.log("getVehiclesByHoaIdOwnerId role received:", role,filter);
    // const oid2 = "616d84252dc9bd0016da9673";
    if (!filter) filter = "owner";
    const qry = { hoaid: hoaId, carownertype: filter, ownerid: ownerid };
    //console.log("Filter received:", filter);
    //  console.log("getVehiclesByHoaIdOwnerId role modified received:", role);
    // console.log("getVehiclesByHoaIdOwnerId oid received:", ownerid);
    //  console.log("vehicle controller getVehiclesByHoaIdOwnerId qry built:", qry);

    const vehicles = await Vehicle.find(qry);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// this called from rount allvehicles

const getVehiclesByHoaIdUserId = async (req, res) => {
  try {
    let { hoaId, ownerid } = req.params;
    let { filter } = req.query;
//616d84252dc9bd0016da9673
    // const oid2 = "616d84252dc9bd0016da9673";

    const qry = { hoaid: hoaId, ownerid: ownerid };
    //console.log("Filter received:", filter);
    //  console.log("getVehiclesByHoaIdOwnerId role modified received:", role);
    // console.log("getVehiclesByHoaIdOwnerId oid received:", ownerid);
   //  console.log("vehicle controller getVehiclesByHoaIdUserId qry built:", qry);

    const vehicles = await Vehicle.find(qry);
    // console.log("vehicle controller shold be 19  qry built:", vehicles.length);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    // console.log("getVehicleById vehicleId:", vehicleId);

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVehiclesForUnitNumber = async (req, res) => {
  try {
    const { hoaId, unitNumber } = req.params;
    //   const now = new Date();
    // const today = new Date(Date.UTC(
    //   now.getUTCFullYear(),
    //   now.getUTCMonth(),
    //   now.getUTCDate()
    // ));
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const qry = { hoaid: hoaId, unitnumber: unitNumber, carownertype: "renter", checkout: { $gte: today } };
    //   console.log("getVehiclesForUnitNumber qry built:", qry);

    const vehicles = await Vehicle.find(qry);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const createVehicle = async (req, res) => {
  try {
    const vehicleData = req.validatedData;
   // console.log("server Creating vehicle with data:", vehicleData);

    const vehicle = await Vehicle.create(vehicleData);

    // Log new vehicle creation
    await logHPSRecord(vehicle);

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const vehicleData = req.validatedData;

    // Fetch old record for comparison
    const oldVehicle = await Vehicle.findById(vehicleId);
    if (!oldVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(vehicleId, vehicleData, { new: true });

    // Log only if startdate or enddate changed
    if (oldVehicle.startdate !== updatedVehicle.startdate || 
        oldVehicle.enddate !== updatedVehicle.enddate) {
      // await logHPSRecord(updatedVehicle, oldVehicle.startdate, oldVehicle.enddate);
      // log the date changes and ignore the old vehicle dates
       await logHPSRecord(updatedVehicle);
    }

    res.status(200).json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVehiclePayment = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { state } = req.body;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    vehicle.requires_payment = state.requires_payment;
    await vehicle.save();
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    //  console.log("Deleting vehicle:", vehicleId);

    const vehicle = await Vehicle.findByIdAndDelete(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({ message: "Vehicle deleted successfully", vehicle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const deleteVehiclesByStatusFlag = async (req, res) => {
  try {
    const { statusFlag } = req.params;

    // console.log("Deleting vehicles with status_flag:", statusFlag);

    const result = await Vehicle.deleteMany({ status_flag: parseInt(statusFlag) });

    //  console.log("Deletion result:", result);

    res.status(200).json({
      message: `${result.deletedCount} vehicle(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const batchUpdateDateFields = async (req, res) => {
  try {
    console.log("Batch updating vehicle date fields");

    const vehicles = await Vehicle.find({});
    let updatedCount = 0;

    for (const vehicle of vehicles) {
      const updateData = {};

      if (vehicle.startdate) {
       // const checkinDate = new Date(vehicle.startdate + 'T00:00:00Z');
         const checkinDate = vehicle.startdate + 'T00:00:00Z';
        updateData.checkin = checkinDate;
      }

      if (vehicle.enddate) {
       // const checkoutDate = new Date(vehicle.enddate + 'T00:00:00Z');
         const checkoutDate = vehicle.enddate + 'T00:00:00Z';
        updateData.checkout = checkoutDate;
      }

      if (Object.keys(updateData).length > 0) {
        await Vehicle.findByIdAndUpdate(vehicle._id, updateData);
        updatedCount++;
      }
    }

    //  console.log("Batch update result:", updatedCount);

    res.status(200).json({
      message: `${updatedCount} vehicle(s) updated successfully`,
      updatedCount: updatedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const jjvrunquery = async (req, res) => {
  try {
    const { hoaId } = req.params;

    //  console.log("getVehiclesByHoaId Filter received params:", req.params);

    const qry = { hoaid: hoaId };


    //  qry.carownertype = "owner";

    const vehicles = await Vehicle.find(qry);
    // vehicles.forEach(v => {
    //   console.log('vehicle found:',v._id,v.plate);
    // });
    for (let i = 0; i < 30 && i < vehicles.length; i++) {
      let veh = vehicles[i];
      //console.log('vehicle found:',veh.plate,veh.startdate,veh.enddate,veh.checkout);
      //  if (i == 5  ) break;

      console.log('');
      console.log('plate=', veh.plate);
      if (veh.plate == '5KFF614') {
        console.log('FOUND 5KFF614 ****************************************************************************************');
      }
      let co = veh.checkout;

      console.log('indatefrom veh checkout=', co);
      let intime = new Date(co).getTime();
      console.log('intime from veh checkout=', intime);
      let codatestr = new Date(co).toISOString().substring(0, 10) + 'T00:00:00Z';
      console.log('codatestr adjusted with T00:00:00Z  =', codatestr);
      let codate0 = new Date(codatestr);
      console.log('codate0 from T0 string=', codate0);
      let cotime0 = codate0.getTime();
      console.log('cotime0 from T0 string=', cotime0);

      let curdate = new Date();
      console.log('curdate =', curdate);
      let curdatestr = curdate.toISOString().substring(0, 10) + 'T00:00:00Z';
      console.log('curdatestr adjusted with T00:00:00Z  =', curdatestr);
      let curdate0 = new Date(curdatestr);
      console.log('current date from T0 string==', curdate0);
      let curtime0 = curdate0.getTime();


      console.log('curtime0=', curtime0);
      console.log('diff intime-cotime0 from T0 string=', intime - cotime0);
      console.log('diff2 cotime0 from T0 string - curtime0 from T0 string= ', cotime0 - curtime0);
      //  console.log('diff3 cotime0 from T0 string - curtime0 = ', cotime0 - curtime0);

    }
    // res.json(vehicles);
    res.status(200).json({
      message: "we did it! jjvrunquery executed successfully",
      hoaId: hoaId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  //  
  // for (let i = 0; i < 10 && i < arr.length; i++) {
  //   console.log(arr[i]);
  // }
  // try {
  //   const { hoaId } = req.params;

  //   console.log("jjvrunquery executing for hoaId:", hoaId);



  //   res.status(200).json({ 
  //     message: "jjvrunquery executed successfully",
  //     hoaId: hoaId
  //   });
  // } catch (error) {
  //   res.status(500).json({ message: error.message });
  // }
};

const getHPSRecordsByHoaId = async (req, res) => {
  try {
    const { hoaId } = req.params;
    const records = await HPSRecord.find({ hoaid: hoaId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRenterVehicles = async (req, res) => {
  try {
    const { hoaId } = req.params;
    const { date } = req.query;

    console.log('date to delete is ',date,hoaId);

     const countBefore = await Vehicle.countDocuments({ 
      hoaid: hoaId, 
      carownertype: "renter", 
      enddate: { $lt: date } 
    });
    console.log('Matching records found:', countBefore);
    

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const result = await Vehicle.deleteMany({
      hoaid: hoaId,
      carownertype: "renter",
      enddate: { $lt: date }
    });

    res.status(200).json({
      message: `${result.deletedCount} renter vehicle(s) deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getVehiclesByHoaId, getVehiclesByHoaIdOwner, getVehiclesByHoaIdOwnerId,
  getVehiclesByHoaIdUserId, getVehicleById, createVehicle, updateVehicle, deleteVehicle,
  deleteVehiclesByStatusFlag, batchUpdateDateFields, jjvrunquery, getVehiclesForUnitNumber,
  updateVehiclePayment, getHPSRecordsByHoaId, deleteRenterVehicles
};
