

export const getVehicleActiveStatusBoolean_checkin = (element) => {
  //const todayUTC = new Date(); // "2025-12-03"
  //const todayStr = todayUTC.toISOString().split('T')[0]; 
  //const todayStr = todayUTC.toLocaleDateString("en-CA");

  const todayUTC = new Date(); // "2025-12-03"
  const todayStr = formatLocalDate(todayUTC);
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

export const getVehicleActiveStatusBoolean = (element) => {

  const todayUTC = new Date(); // "2025-12-03"
  const todayStr = formatLocalDate(todayUTC);

  //const mongoDateIn = new Date(element.checkin);
  const mongoDateInStr = element.startdate;
  // const mongoDate = new Date(element.checkout);
  const mongoDateOutStr = element.enddate;

  if (mongoDateInStr > todayStr && mongoDateOutStr > todayStr) {
    //  console.log('getVehicleActiveStatusBoolean rvalue is true',mongoDateInStr,mongoDateStr,todayStr);
    return false;
  }
  if (mongoDateOutStr >= todayStr) {
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
  const mongoDateInStr = sdate; //formatLocalDate(new Date(sdate)); //utcDateOnly(mongoDateIn);
  //const mongoDate = new Date(edate);
  const mongoDateOutStr = edate; //formatLocalDate(new Date(edate));

  //console.log('vhelper use formatLocalDate', mongoDateInStr, mongoDateOutStr, todayStr);

  if (mongoDateInStr == todayStr && mongoDateOutStr == todayStr) {
    return true;
  }

  if (mongoDateInStr > todayStr && mongoDateOutStr > todayStr) {
    return false;
  }
  if (mongoDateOutStr >= todayStr) {
    return true;
  }
  else {
    return false;
  }
}

export const getVehicleIsActiveTodayBoolean_checkin = (element) => {
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


export const getVehicleIsActiveTodayBoolean = (element) => {

  const todayUTC = new Date();
  const todayStr = formatLocalDate(todayUTC);
  const mongoDateStr = element.enddate;
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




// *********** THIS IS THE METHOD THAT GETS CALLED 
// *********** THIS IS THE METHOD THAT GETS CALLED 
// *********** THIS IS THE METHOD THAT GETS CALLED 





export const okToAddUnitVehicle = (formvehicle, vehiclearray, ownerOfUnit, vehicleId, unit, createdfrom, pincodeAction) => {
  const formsdate = formvehicle.startdate;
  const formedate = formvehicle.enddate;

  const todayUTC = new Date(); // "2025-12-03"
  const todayStr = formatLocalDate(todayUTC);
  const allActiveVehicles = vehiclearray.filter(v => v.calculatedActiveFlag === true);
  const allActiveVehiclesCount = allActiveVehicles.length;

  //console.log('OKTOADD incoming array is ',vehiclearray);
  //console.log('OKTOADD incoming allActiveVehicles array is  ',allActiveVehiclesCount,allActiveVehicles);
  //console.log('OKTOADD formvehicle.carownertype',formvehicle.carownertype);
  // console.log('OKTOADD vehicleId', vehicleId);
  //console.log('OKTOADD createdfrom', createdfrom);
  // console.log('OKTOADD pincodeAction',pincodeAction);
  // console.log('OKTOADD formsdate',formsdate);
  // console.log('OKTOADD formedate',formedate);
  //console.log('OKTOADD allActiveVehiclesCount',allActiveVehiclesCount);
  //  console.log('OKTOADD UNIT IS ',unit);
  // console.log('OKTOADD FORM DATA IS ', formvehicle);


  // let rentervehs = allActiveVehicles.filter(v => v.carownertype === 'renter').length
  // let ownervehs = allActiveVehicles.filter(v => v.carownertype !== 'renter').length

  let rentervehs = vehiclearray.filter(v => v.carownertype === 'renter' && v.calculatedActiveFlag === true).length
  let ownervehs = vehiclearray.filter(v => v.carownertype !== 'renter' && v.calculatedActiveFlag === true).length
  let dayusevehs = vehiclearray.filter(v => v.carownertype === 'dayuseonly' && v.calculatedActiveFlag === true).length
  let dayusevehsany = vehiclearray.filter(v => v.carownertype === 'dayuseonly').length
  // console.log('VH all active rentervehs are', rentervehs);
  // console.log('VH all active ownervehs are', ownervehs);
  // console.log('VH all active dayusevehs are', dayusevehs);
  // console.log('VH all active dayusevehsany are', dayusevehsany);

  let maxactiveallowed = unit.parking_allowed_unit;
  let maxdayuse = unit.daypasses_allowed_owner;

  let filteredActiveArray = vehiclearray.filter(v => v.calculatedActiveFlag === true);
  let filteredActiveArrayCount = filteredActiveArray.length
  let dayUseCount = daypassVehicleCount(vehiclearray);
  let anyDayUseCount = anyDaypassVehicleCount(vehiclearray);
  // let totalActiveMinusDayUseCount = filteredActiveArrayCount - dayUseCount;
  // let ownerFreeParking = unit.owner_free_parking || 0;
  // let oktoadd = null;
  let irpflag = 0;
  let dates_span_today = getVehicleActiveStatusBoolean2(formsdate, formedate);  // if dates are equal it will return true if they are today
  console.log('VH dates_span_today', dates_span_today)
  console.log('VH day use count ownervehicles', dayUseCount, anyDayUseCount, formsdate, formedate, getVehicleActiveStatusBoolean2(formsdate, formedate));
  let msgType = 0;
  let robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 0 };

  if (createdfrom === 'ownervehicles' || createdfrom === 'rentervehicles') {
    let formdayusecnt = 0;
    if (formvehicle.day_use_only === 1) {
      formdayusecnt = 1;
    }
    if (!vehicleId) {
      if (!dates_span_today) {
        robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 0 };
        return robj;
      }
      if (dates_span_today) {
        console.log('VH allActiveVehiclesCount', allActiveVehiclesCount);
        console.log('VH maxactiveallowed', maxactiveallowed);
        console.log('VH all active rentervehs are', rentervehs);
        console.log('VH dayusevehs', dayusevehs);
        console.log('VH dayusevehsany', dayusevehsany);
        console.log('VH formdayusecnt', formdayusecnt);
        if (formdayusecnt === 1) {
          // IF ANY DAYUSE TEMPLATE IS OUT THERE BAIL
          if (dayusevehsany > 0) {
            robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 3 };
            return robj;
          }
        }
        if (allActiveVehiclesCount >= (maxactiveallowed + dayusevehsany)) {
          console.log('we are here with count')
          if (rentervehs > 0) {
            robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 2 };
          } else {
            robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 1 };
          }
          return robj;

        } else {
          robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 1 };
          return robj;
        }
      }
    }
    // VEHICLE ID EXISTS
    // console.log("VH LINE 281 ALL VEHICLES PASSED IN",vehiclearray);

    let theCurrentVehicleAry = vehiclearray.filter(v => v._id === vehicleId);
    let theCurrentVehicle = theCurrentVehicleAry[0];
    let is_vehicle_active = theCurrentVehicle.calculatedActiveFlag === true;
    let is_day_use_vehicle = theCurrentVehicle.day_use_only === 1;

    if (is_vehicle_active && dates_span_today) {
      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
      return robj;
    }
    if (is_vehicle_active && !dates_span_today) {
      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
      return robj;
    }
    if (!is_vehicle_active && dates_span_today) {
      if (is_day_use_vehicle) {
        robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
        return robj;
      }

      // console.log('allActiveVehiclesCount', allActiveVehiclesCount);
      // console.log('maxactiveallowed', maxactiveallowed);
      // console.log('dayusevehs', dayusevehs);
      // console.log('dayusevehsany', dayusevehsany);
      // console.log('formdayusecnt', formdayusecnt);


      if (allActiveVehiclesCount >= maxactiveallowed + dayusevehsany) {
        if (rentervehs > 0) {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 2 };
        } else {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 1 };
        }
      } else {
        robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 1 };
      }
      return robj;
    }

    if (!is_vehicle_active && !dates_span_today) {
      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
      return robj;
    }
  }


  if (createdfrom === 'xrentervehicles') {
    console.log('RENTER VEHICLES okToAddUnitVehicle formvehicle', formvehicle)
    if (!vehicleId) {
      if (!dates_span_today) {
        robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 0 };
        return robj;
      }
      if (dates_span_today) {
        //  console.log('maxactive before',maxactiveallowed)
        //  if (formvehicle.day_use_only === 1) {
        //     maxactiveallowed += 1
        //   }
        // console.log('maxactive after',maxactiveallowed)
        if (allActiveVehiclesCount >= maxactiveallowed) {
          // if (rentervehs === 0) {
          //   robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 1 };
          // } else {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 2 };
          // }
        } else {
          robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 0 };
          // if (dayUseCount >= maxdayuse && (formvehicle.carownertype === 'dayuseonly' || formvehicle.carownertype === 'multiday')) {
          if (dayUseCount >= maxdayuse) {
            robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 3 };
          }
        }
        return robj;
      }
    }

    let theCurrentVehicleAry = vehiclearray.filter(v => v._id === vehicleId);
    let theCurrentVehicle = theCurrentVehicleAry[0];
    let is_vehicle_active = theCurrentVehicle.calculatedActiveFlag === true;

    if (is_vehicle_active && dates_span_today) {
      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
      return robj;
    }
    if (is_vehicle_active && !dates_span_today) {
      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
      return robj;
    }
    if (!is_vehicle_active && dates_span_today) {
      if (allActiveVehiclesCount >= maxactiveallowed) {
        console.log('WE ARE HERE YOU DUMMY DATE SPANS', allActiveVehiclesCount, maxactiveallowed)
        if (rentervehs > 0) {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 2 };
        } else {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 2 };
        }
      } else {
        console.log('WE ARE HERE YOU DUMMY')
        robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
        if (dayUseCount >= maxdayuse) {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 3 };
        }
      }
      return robj;
    }
    if (!is_vehicle_active && !dates_span_today) {
      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
      return robj;
    }
  }


} // end of okToAddUnitVehicle


export const anyDaypassVehicleCount = (vehicles) => {
  let cnt = 0;
  vehicles.forEach((el) => {
    if (el.day_use_only === 1) {
      cnt += 1
    }
  });
  return cnt;
}


export const daypassVehicleCount = (vehicles) => {
  //console.log('CALLING DAYPASSVEHICLECOUNT')
  const todayUTC = new Date(); // "2025-12-03"
  const todayStr = formatLocalDate(todayUTC);
  let cnt = 0;
  vehicles.forEach((el) => {
    //  console.log('daypassVehicleCount dates',el.startdate,el.enddate,todayStr, getVehicleActiveStatusBoolean2(el.startdate, el.enddate));
    if (el.day_use_only === 1) {
      if (getVehicleActiveStatusBoolean2(el.startdate, el.enddate)) {
        cnt += 1
      }
    }
  });
  return cnt;
}

export const handicappedVehicleCount = (vehicles) => {
  // console.log('CALLING handicappedVehicleCount',vehicles)
  const todayUTC = new Date(); // "2025-12-03"
  const todayStr = formatLocalDate(todayUTC);
  let cnt = 0;
  vehicles.forEach((el) => {
    // console.log('handicapped',el.handicapped);
    if (el.handicapped === 1) {
      cnt += 1
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



