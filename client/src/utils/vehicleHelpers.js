

export const getVehicleActiveStatusBoolean = (element) => {
  const todayUTC = new Date(); // "2025-12-03"
  //const todayStr = todayUTC.toISOString().split('T')[0]; 
  const todayStr = todayUTC.toLocaleDateString("en-CA");
  // const today = new Date(Date.UTC(
  //   now.getUTCFullYear(),
  //   now.getUTCMonth(),
  //   now.getUTCDate()
  //  ));
  // const today = new Date();
  // today.setHours(0, 0, 0, 0);
  // Date.UTC(
  //   now.getUTCFullYear(),
  //   now.getUTCMonth(),
  //   now.getUTCDate()
  // ));
  //const mongoDate = new Date(element.enddate);
  //console.log('the mongodate is ',mongoDate);


  const mongoDateIn = new Date(element.checkin);
  const mongoDateInStr = utcDateOnly(mongoDateIn);
  const mongoDate = new Date(element.checkout);
  const mongoDateStr = utcDateOnly(mongoDate);

  if (mongoDateInStr > todayStr && mongoDateStr >= todayStr) {
    //  console.log('getVehicleActiveStatusBoolean rvalue is true',mongoDateInStr,mongoDateStr,todayStr);
    return false;
  }
  if (mongoDateStr >= todayStr) {
    //  console.log('getVehicleActiveStatusBoolean rvalue is true',mongoDateInStr,mongoDateStr,todayStr);
    return true;
  }


  else {
    // console.log('getVehicleActiveStatusBoolean rvalue is false')

    return false;
  }
}

const formatLocalDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;


const getVehicleActiveStatusBoolean2 = (sdate, edate) => {
  const todayUTC = new Date(); // "2025-12-03"
  //const todayStr = todayUTC.toISOString().split('T')[0]; 
  const todayStr = formatLocalDate(todayUTC);

  //const mongoDateIn = new Date(sdate);
  const mongoDateInStr = formatLocalDate(new Date(sdate)); //utcDateOnly(mongoDateIn);
  //const mongoDate = new Date(edate);
  const mongoDateStr = formatLocalDate(new Date(edate));

  //console.log('vhelper use formatLocalDate',mongoDateInStr,mongoDateStr);

  if (mongoDateInStr > todayStr && mongoDateStr >= todayStr) {
    return false;
  }
  if (mongoDateStr >= todayStr) {
    return true;
  }
  else {
    return false;
  }
}

export const getVehicleIsActiveTodayBoolean = (element) => {
  // const now = new Date();
  // const today = new Date(Date.UTC(
  //   now.getUTCFullYear(),
  //   now.getUTCMonth(),
  //   now.getUTCDate()
  // ));
  //const now = new Date();
  const todayUTC = new Date();
  //const todayStr = todayUTC.toISOString().split('T')[0];
  const todayStr = todayUTC.toLocaleDateString("en-CA");
  const mongoDate = new Date(element.checkout);
  const mongoDateStr = utcDateOnly(mongoDate);
  if (mongoDateStr == todayStr) {
    return true;
  } else {
    return false;
  }
}

// JJVFIX on 10242026 I decided that the utcDateOnly should return a date based on local year etc
export const utcDateOnly = (isoStr) => {
  const d = new Date(isoStr);
 // return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const formatPhoneNumber = (phone) => {
  phone = phone.replace(/\D/g, '');
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}



export const okToAddUnitVehicle = (formvehicle, vehiclearray, ownerOfUnit, vehicleId, unit, createdfrom, pincodeAction) => {
  const formsdate = formvehicle.startdate;
  const formedate = formvehicle.enddate;

  console.log('okToAddUnitVehicle formvehicle.carownertype, vehicleId,createdfrom,pincodeAction');
  console.log(formvehicle.carownertype,  vehicleId, createdfrom, pincodeAction);

  const todayStr = new Date().toLocaleDateString("en-CA");
  let maxactiveallowed = unit.parking_allowed_unit;
  //  console.log('maxactiveallowed', maxactiveallowed);

  let filteredActiveArray = vehiclearray.filter(v => v.calculatedActiveFlag === true);
  let filteredActiveArrayCount = filteredActiveArray.length
  let dayUseCount = daypassVehicleCount(vehiclearray);
  let totalActiveMinusDayUseCount = filteredActiveArrayCount - dayUseCount;

  if (pincodeAction === 'dayuse') {
    maxactiveallowed += 1
  }

  // console.log('totalActiveCount and incoming array', filteredActiveArrayCount, dayUseCount, vehiclearray);

  let ownerFreeParking = unit.owner_free_parking || 0;

  let oktoadd = null;
  let irpflag = 0;

  let dates_span_today = getVehicleActiveStatusBoolean2(formsdate, formedate);

  let msgType = 0;

  let robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null , msgType:0};


  // THIS SECTION IS FOR ADDING A VEHICLE FROM THE OWNERS OR OTHER
  if (!vehicleId) {
    console.log("WE MUST NEW VEHICLE");
    // it is ok to add a vehicle whos date is not active if you are a owner and adding to inventory
    if (!dates_span_today) {
      console.log("form dates are NOT active, vehicle is null");
      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType:0 };
      return robj;
    }
    if (dates_span_today) {
      console.log("form dates ARE active, vehicle is null")
      if (filteredActiveArrayCount >= maxactiveallowed) {
        robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType:1};
      } else {
        robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType:0 };
      }
      return robj;
    }
  }

  // THIS SECTION IS WHEN A VEHICLE HAS BEEN SELECTED BY OWNER OR OTHER

  console.log("WE MUST BE AN EDIT OF AN EXISTING VEHICLE");

  let theCurrentVehicleAry = vehiclearray.filter(v => v._id === vehicleId);
  let theCurrentVehicle = theCurrentVehicleAry[0];
  //  console.log('CURRENT VEHICLE', theCurrentVehicle);

  let is_vehicle_active = theCurrentVehicle.calculatedActiveFlag === true;

  if (is_vehicle_active && dates_span_today) {
    console.log("form dates are active, vehicle is active");
    robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType:0 };
    return robj;
  }
  if (is_vehicle_active && !dates_span_today) {
    console.log("form dates are not active, vehicle is active")
    robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType:0 };
    return robj;
  }
  if (!is_vehicle_active && dates_span_today) {
    console.log("form dates active, vehicle is not active")
    if (filteredActiveArrayCount >= maxactiveallowed) {
      robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle , msgType:1};
    } else {
      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle , msgType:0};
    }
    return robj;
  }
  if (!is_vehicle_active && !dates_span_today) {
    console.log("form dates are not active, vehicle is not active");
    robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType:0 };
    return robj;
  }
}





// export const daypassVehicleCountxx = (vehicles) => {
//   // console.log('daypassVehicleCount unit',vehicles);
//   let cnt = 0;
//   vehicles.forEach((el) => {
//     if (el.pin_code_action === "dayuse") {
//       if (getVehicleActiveStatusBoolean(el)) {
//       cnt += 1
//       }
//     }
//   });
//   return cnt;
// }

export const daypassVehicleCount = (vehicles) => {
  //console.log('CALLING DAYPASSVEHICLECOUNT')
  let cnt = 0;
  vehicles.forEach((el) => {
  //  console.log('daypassVehicleCount el day_use_only',el.day_use_only);
    if (el.day_use_only === 1) {
      if (getVehicleActiveStatusBoolean(el)) {
      cnt += 1
      }
    }
  });
  return cnt;
}



// let filteredActive = [];
// if (vehicleId) {
//   filteredActive = activeArray.filter(v => v._id === vehicleId);
//   const thevehicle = filteredActive[0];
//   const rp = thevehicle.requires_payment;
//   robj = { oktoadd: true, rpflag: rp }
//   return  robj; //{ oktoadd: true, rpflag: rp };
// } else {
//   if (activeArray.length == 0) {
//      robj = { oktoadd: true, rpflag: 0 }
//     return robj; //{ oktoadd: true, rpflag: 0 };
//   }
//   if (activeArray.length == 1 && (activeArray[0].requires_payment == 1 || activeArray[0].requires_payment == 2)) {
//      robj = { oktoadd: true, rpflag: 0 }
//     return robj; //{ oktoadd: true, rpflag: 0 };
//   }
//   if (activeArray.length == 1 && activeArray[0].requires_payment == 0) {
//     robj = { oktoadd: true, rpflag: 1 }
//     return robj; //{ oktoadd: true, rpflag: 1 };
//   }
// }
// return robj;

// if (activeArray.length == 1 && activeArray[0].requires_payment == 1) {
//   console.log('RETURNING REQUIRES PAYMENT TRUE')
//   return {oktoadd:true, rpflag:0};
// }
//  if (activeArray.length == 1 && activeArray[0].requires_payment == 0) {
//   console.log('RETURNING REQUIRES PAYMENT TRUE')
//   return {oktoadd:true, rpflag:1};
// }
// console.log('RETURNING NEITHER CONDITION TRUE')
//  return {oktoadd:true,  rpflag:0};



