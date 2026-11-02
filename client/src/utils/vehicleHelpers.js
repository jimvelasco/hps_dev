

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
  console.log('okToAddUnitVehicle vehiclearray', vehiclearray)
  const allActiveVehicles = vehiclearray.filter(v => v.calculatedActiveFlag === true);
  const allActiveVehiclesCount = allActiveVehicles.length;

  const veh_grp_ary = getVehicleTypeGroups(vehiclearray, false);
  console.log('we are in vehicle helpers grpary', veh_grp_ary)
  // console.log('formvehicle', formvehicle)
  // console.log('all active', allActiveVehicles)

 // console.log('OKTOADD incoming array is ', vehiclearray);
 // console.log('OKTOADD incoming allActiveVehicles array is  ', allActiveVehiclesCount, allActiveVehicles);
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

  // let rentervehs = vehiclearray.filter(v => v.carownertype === 'renter' && v.calculatedActiveFlag === true).length
  // let ownervehs = vehiclearray.filter(v => v.carownertype !== 'renter' && v.calculatedActiveFlag === true).length
  // let dayusevehs = vehiclearray.filter(v => v.carownertype === 'dayuseonly' && v.calculatedActiveFlag === true).length
  // let dayusevehsany = vehiclearray.filter(v => v.carownertype === 'dayuseonly').length
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
  // console.log('VH dates_span_today', dates_span_today)
  //  console.log('VH day use count ownervehicles', dayUseCount, anyDayUseCount, formsdate, formedate, 
  //  getVehicleActiveStatusBoolean2(formsdate, formedate));
  let msgType = 0;
  let robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 0 };
  let freeparkinglimit = unit.renter_free_parking;
//  console.log('free parking for unit is', freeparkinglimit);

  if (createdfrom === 'ownervehicles' || createdfrom === 'rentervehicles') {
    // this is run for blank vehicle records (new vehicles)
    let formdayusecnt = 0;

    if (createdfrom === 'ownervehicles' && formvehicle.day_use_only === 1) {
      formdayusecnt = 1;
    }


  // if (createdfrom === 'ownervehicles' && (formvehicle.carownertype === 'dayuseonly' || formvehicle.carownertype === 'multiday')) {
  //         robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 0 };
  //         let mdc = veh_grp_ary.multidayvehsany.count;
  //         let duc = veh_grp_ary.dayusevehsany.count;
  //         if ((mdc + duc) >= maxdayusemulti) {
  //            robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 5 };
  //         }
  //         return robj;
  //       }






    if (!vehicleId) {
      if (!dates_span_today) {

        const maxdayusemulti = 2;
       
        if (createdfrom === 'ownervehicles' && (formvehicle.carownertype === 'dayuseonly' || formvehicle.carownertype === 'multiday')) {
          robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 0 };
          let mdc = veh_grp_ary.multidayvehsany.count;
          let duc = veh_grp_ary.dayusevehsany.count;
          if ((mdc + duc) >= maxdayusemulti) {
             robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 5 };
          }
          return robj;
        }
      }
      if (dates_span_today) {

        // console.log('VH veh_grp_ary', veh_grp_ary);
        // this will never be true for renter vehicle
        if (formdayusecnt === 1) {
          if (veh_grp_ary.dayusemultivehs.count > 0) {
            robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 3 };
            return robj;
          }
        }

        if (createdfrom === 'ownervehicles' && (formvehicle.carownertype === 'dayuseonly' || formvehicle.carownertype === 'multiday')) {
          // we could be potenially be adding a day use vehicle so check if they are out there already
          ///console.log('WE ARE ADDING A DAY USE TYPE OF VEHICLE max day use is ',maxdayuse)
          if (veh_grp_ary.dayusemultivehs.count < maxdayuse) {
            robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 1 };
          } else {
            robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 3 };
          }
          return robj;
        }


        // console.log('VH allactive,maxallowed,dumucount',allActiveVehiclesCount,maxactiveallowed,veh_grp_ary.dayusemultivehs.count)

        // if (allActiveVehiclesCount >= (maxactiveallowed + veh_grp_ary.dayusemultivehs.count)) {
        if (veh_grp_ary.allactivevehs.count >= (maxactiveallowed + veh_grp_ary.dayusemultivehs.count)) {

          if (veh_grp_ary.rentervehs.count > 0) {
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

    let requirespayment = theCurrentVehicle.requires_payment;
  
    if (is_vehicle_active && dates_span_today) {
      robj = { oktoadd: true, rpflag: 0, currentVehicle: theCurrentVehicle, msgType: 0 };
      return robj;
    }
    if (is_vehicle_active && !dates_span_today) {
      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
      return robj;
    }



    if (!is_vehicle_active && dates_span_today) {
   //   console.log('existing  dates_span_today veh_grp_ary', veh_grp_ary)
      if (is_day_use_vehicle) {
        // console.log("IT IS A DAY USE VEHICLE",theCurrentVehicle);
        // console.log("IT IS A DAY  dayusevehs",veh_grp_ary.dayusevehs.count);
        // console.log("IT IS A DAY  multidayvehs",veh_grp_ary.multidayvehs.count);
        // console.log("IT IS A DAY  dayusemultivehs",veh_grp_ary.dayusemultivehs.count);
        robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
        if (veh_grp_ary.dayusemultivehs.count >= maxdayuse) {
        robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 3 };

        }
        return robj;
      }

      const maxdayusemulti = 2;

      // if (createdfrom === 'ownervehicles' && (formvehicle.carownertype === 'dayuseonly' || formvehicle.carownertype === 'multiday')) {
      //     robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 0 };
      //     let mdc = veh_grp_ary.multidayvehsany.count;
      //     let duc = veh_grp_ary.dayusevehsany.count;
      //     if ((mdc + duc) >= maxdayusemulti) {
      //        robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 5 };
      //     }
      //     return robj;
      //   }

      // if (veh_grp_ary.dayusemultivehs.count > 0) {
      //   robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 3 };
      //   return robj;
      // }

      // console.log('allActiveVehiclesCount', allActiveVehiclesCount);
      // console.log('maxactiveallowed', maxactiveallowed);
      // console.log('formdayusecnt', formdayusecnt);




      if (allActiveVehiclesCount >= maxactiveallowed + veh_grp_ary.dayusemultivehs.count) {
        if (veh_grp_ary.rentervehs.count > 0) {
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
      console.log('THIS IS WHERE')
      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
      return robj;
    }
  }



} // end of okToAddUnitVehicle


export const getVehicleTypeGroups = (vehicles, log = false) => {
  const ownerTypes = ['owner', 'friend', 'family', 'tenant'];
  // nonownervehs will include active daypass or multi vehicles
  //const allActiveVehicles = vehiclearray.filter(v => v.calculatedActiveFlag === true);
  const groups = [
    { name: 'rentervehs', matches: v => v.carownertype === 'renter' && v.calculatedActiveFlag === true },
    { name: 'nonownervehs', matches: v => v.carownertype !== 'renter' && v.calculatedActiveFlag === true },
    { name: 'ownervehs', matches: v => ownerTypes.includes(v.carownertype) && v.calculatedActiveFlag === true },
    { name: 'dayusevehs', matches: v => v.carownertype === 'dayuseonly' && v.calculatedActiveFlag === true },
    { name: 'dayusevehsany', matches: v => v.carownertype === 'dayuseonly' },
    { name: 'multidayvehs', matches: v => v.carownertype === 'multiday' && v.calculatedActiveFlag === true },
    { name: 'multidayvehsany', matches: v => v.carownertype === 'multiday' },
    { name: 'dayusemultivehs', matches: v => (v.carownertype === 'dayuseonly' || v.carownertype === 'multiday') && v.calculatedActiveFlag === true },
    { name: 'dayusemultivehsany', matches: v => v.carownertype === 'dayuseonly' || v.carownertype === 'multiday' },
    { name: 'allactivevehs', matches: v => v.calculatedActiveFlag === true }
  ];

  const groupArray = Object.fromEntries(groups.map(({ name, matches }) => {
    const array = vehicles.filter(matches);
    return [name, { count: array.length, array }];
  }));

  if (log) console.log('Vehicle type groups from function getVehicleTypeGroups:', groupArray);

  return groupArray;
}

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



