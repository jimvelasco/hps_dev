

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
  const veh_grp_ary = getVehicleTypeGroups(vehiclearray, false);
  const maxenddateofgroup = getMaxEnddateOfVehicles(veh_grp_ary.nonownervehs.array);

  const todayUTC = new Date(); // "2025-12-03"
  const todayStr = formatLocalDate(todayUTC);
 //   console.log('okToAddUnitVehicle vehiclearray', vehiclearray)
  const allActiveVehicles = vehiclearray.filter(v => v.calculatedActiveFlag === true);
  const allActiveVehiclesCount = allActiveVehicles.length;
  //  console.log('okToAddUnitVehicle allActiveVehicles', allActiveVehicles)

  

     

 //  console.log('formvehicle', formvehicle)
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



  let maxactiveallowed = unit.parking_allowed_unit;
  let maxdayuse = unit.daypasses_allowed_owner;
  if (localStorage.getItem('logonType') === 'tenant') {
    maxdayuse = unit.daypasses_allowed_tenant
  }


  //console.log('role of logged on person ', localStorage.getItem('logonType'),maxdayuse)

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
 // console.log('free parking for unit is', freeparkinglimit);

 let allowedmultidaytemplates = 1;

  if (createdfrom === 'ownervehicles' || createdfrom === 'rentervehicles') {
    // this is run for blank vehicle records (new vehicles)
  // console.log('formvehicle okToAddUnitVehicle either',formvehicle);
    let formdayusecnt = 0;
    if (createdfrom === 'ownervehicles' && formvehicle.day_use_only === 1) {
      formdayusecnt = 1;
    }
    if (createdfrom === 'rentervehicles' && formvehicle.day_use_only === 1) {
      formdayusecnt = 1;
    }

     let overlapbump = 0;
     if (maxenddateofgroup === formsdate) {
      overlapbump = 1;
     }
     //console.log('overlapbump',overlapbump);
     if (veh_grp_ary.rentervehs.count >= freeparkinglimit) {
      irpflag = 0; // would be 1 if payment implemeted
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



    let showerror = false;
    let messagetoshow = '';



    if (!vehicleId) {
      if (!dates_span_today) {
        robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 0 };
        return robj;
      }


      if (dates_span_today) {

        console.log('veh_grp_ary.allactivevehs.count', veh_grp_ary.allactivevehs.count);
        console.log('maxactiveallowed', maxactiveallowed);
        console.log(' veh_grp_ary.dayusemultivehs.count', veh_grp_ary.dayusemultivehs.count);
    //    console.log(' veh_grp_ary.nonownervehs.count', veh_grp_ary.nonownervehs.count);

        console.log('formdayusecnt', formdayusecnt);
        console.log('overlapbump', overlapbump);
         console.log('formdata owner type', formvehicle.carownertype);

     //   console.log("VH dates_span_today is true", dates_span_today);
     

        // console.log('VH veh_grp_ary', veh_grp_ary);
        // this will never be true for renter vehicle
        if (formdayusecnt === 1) {  //means we passed in a dayuseonly form
         // console.log('we are passed a dayuseonly form')
          if (veh_grp_ary.dayusemultivehs.count >= maxdayuse ) {
            // console.log('we are passed a dayuseonly form FAIL')
            robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 3 };
            return robj;
          } else {
          //  console.log('we are passed a dayuseonly form GOOD')
             robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 0 };
            return robj;
          }
        }


//console.log('veh_grp_ary.allactivevehs.array',veh_grp_ary.allactivevehs.array)
        


        if (veh_grp_ary.allactivevehs.count >= (maxactiveallowed + veh_grp_ary.dayusemultivehs.count +  overlapbump)) {
            robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 2 };
          return robj;
        }


          if (createdfrom === 'ownervehicles' && veh_grp_ary.rentervehs.count > 0) {
            robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 6 };
            return robj;
          }
         



        // if (createdfrom === 'ownervehicles' && (formvehicle.carownertype === 'dayuseonly' ||
        //   formvehicle.carownertype === 'tenant' )) {

         

        //   if (veh_grp_ary.dayusemultivehs.count  < maxdayuse + formdayusecnt) {
        //     robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 1 };
        //   } else {
        //     showerror = true;
        //     robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 3 };
        //   }

        //   if (veh_grp_ary.rentervehs.count > 0) {
        //     showerror = true;
        //     robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 6 };
        //     return robj;
        //   }
        // }

      }
      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 0 };
      return robj;
    }

    //else {

    // VEHICLE ID EXISTS


    let theCurrentVehicleAry = vehiclearray.filter(v => v._id === vehicleId);
    let theCurrentVehicle = theCurrentVehicleAry[0];
   // console.log('VD EXISTS the current vehicle is', theCurrentVehicle)
    let is_vehicle_active = theCurrentVehicle.calculatedActiveFlag === true;
    let is_day_use_vehicle = theCurrentVehicle.day_use_only === 1;
    const maxdayusemulti = 2;
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
      if (is_day_use_vehicle) {
        robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
        if (veh_grp_ary.dayusemultivehs.count >= maxdayuse) {
          console.log('VH BAILED ON veh_grp_ary.dayusemultivehs.count >= maxdayuse')
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 3 };
          return robj;
        }
        return robj;
      }

      if (createdfrom === 'ownervehicles' && formvehicle.carownertype === 'tenant' && veh_grp_ary.tenantvehsany.count > 1) {
        robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 7 };
        return robj;
      }

      // if (allActiveVehiclesCount >= maxactiveallowed + veh_grp_ary.dayusemultivehs.count) {
      //   if (veh_grp_ary.rentervehs.count > 0) {
      //     console.log('VH BAILED ON veh_grp_ary.rentervehs.count > 0')
      //     robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 2 };
      //   } else {
      //     robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 1 };
      //   }
      //   return robj;
      // } else {
      //   robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 1 };
      //   if (veh_grp_ary.dayusemultivehs.count > 0) {
      //     console.log('VH BAILED ON veh_grp_ary.dayusemultivehs.count > 0')
      //     robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 3 };
      //   }
      //   return robj;
      // }
       if (allActiveVehiclesCount >= maxactiveallowed + veh_grp_ary.dayusemultivehs.count) {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 2 };
          return robj;
        } else {
          robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0};
          return robj;
        }      
    }






    if (!is_vehicle_active && !dates_span_today) {
      //   console.log('THIS IS WHERE')
      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
      return robj;
    }





  }
} // end of okToAddUnitVehicle


export const getVehicleTypeGroups = (vehicles, log = false) => {
  const ownerTypes = ['owner', 'friend', 'family', 'tenant','rentalmanager'];
  // nonownervehs will include active daypass or multi vehicles
  //const allActiveVehicles = vehiclearray.filter(v => v.calculatedActiveFlag === true);
  const groups = [
    { name: 'rentervehs', matches: v => v.carownertype === 'renter' && v.calculatedActiveFlag === true },
    { name: 'nonownervehs', matches: v => v.carownertype !== 'renter' && v.calculatedActiveFlag === true },
    { name: 'nonownervehsany', matches: v => v.carownertype !== 'renter' },
    { name: 'ownervehs', matches: v => ownerTypes.includes(v.carownertype) && v.calculatedActiveFlag === true },
    { name: 'dayusevehs', matches: v => v.carownertype === 'dayuseonly' && v.calculatedActiveFlag === true },
    { name: 'dayusevehsany', matches: v => v.carownertype === 'dayuseonly' },
    { name: 'multidayvehs', matches: v => v.carownertype === 'multiday' && v.calculatedActiveFlag === true },
    { name: 'multidayvehsany', matches: v => v.carownertype === 'multiday' },
    { name: 'dayusemultivehs', matches: v => (v.carownertype === 'dayuseonly' || v.carownertype === 'multiday') && v.calculatedActiveFlag === true },
    { name: 'dayusemultivehsany', matches: v => v.carownertype === 'dayuseonly' || v.carownertype === 'multiday' },
    { name: 'allactivevehs', matches: v => v.calculatedActiveFlag === true },
    { name: 'tenantvehsany', matches: v => v.carownertype === 'tenant' }
  ];

  const groupArray = Object.fromEntries(groups.map(({ name, matches }) => {
    const array = vehicles.filter(matches);
    return [name, { count: array.length, array }];
  }));

  if (log) console.log('Vehicle type groups from function getVehicleTypeGroups:', groupArray);

  return groupArray;
}





export const getMaxEnddateOfVehicles = (vehicles) => {
  return vehicles.reduce((maxEnddate, vehicle) => {
    return vehicle.enddate && (!maxEnddate || vehicle.enddate > maxEnddate)
      ? vehicle.enddate
      : maxEnddate;
  },  null); //null
}

export const getMinStartdateOfVehicles = (vehicles) => {
  return vehicles.reduce((minStartdate, vehicle) => {
    return vehicle.startdate && (!minStartdate || vehicle.startdate < minStartdate)
      ? vehicle.startdate
      : minStartdate;
  }, null);
}

//  const todayUTC = new Date(); // "2025-12-03"
//   const todayStr = formatLocalDate(todayUTC);

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

 // form valication

  //  export const getCreateValidationMessage = () => {
  
  //     let unitParkingLimit = Number(unit.parking_allowed_unit);
  //     let freepassesallowed = Number(unit.daypasses_allowed_owner);
  //     const veh_grp_ary = getVehicleTypeGroups(vehicles);
  //     console.log('veh_grp',veh_grp_ary);
  //      console.log('unitParkingLimit',unitParkingLimit);
  //       console.log('freepassesallowed',freepassesallowed);
  
  //     if (pincodeAction === 'dayuseonly') {
  //       if (veh_grp_ary.dayusemultivehs.count > 0) {
  //         console.log('BAILED ON veh_grp_ary.dayusemultivehs.count > 0')
  //         return (<>You are not allowed to have <br />more daypassed<br />than allowed: {freepassesallowed}<br /><br />
  //           Call Admin to get an<br />increase in day passes. </>);
  //       }
  //       return null;
  //     }
  
  //     if (veh_grp_ary.rentervehs.count >= unitParkingLimit) {
  //       console.log('BAILED ON (veh_grp_ary.rentervehs.count >=  unitParkingLimit')
  //       return (<>You are not allowed to have <br />more active vehicles than<br /> the parking allowance: {unitParkingLimit}.
  //       </>);
  //     }
  //     if (veh_grp_ary.allactivevehs.count >= unitParkingLimit) {
  //       console.log('BAILED ON veh_grp_ary.allactivevehs.count >=  unitParkingLimit ')
  //       return (<>You are not allowed to have <br />more active vehicles than<br /> your parking allowance: {unitParkingLimit}.
  //         <br />There may be an owner in the unit. </>);
  //     }
  //     if (veh_grp_ary.ownervehs.count > 0) {
  //       console.log('BAILED ON (veh_grp_ary.ownervehs.count > 0')
  //       return (<> There may be an owner in the unit.<br /><br />
  //         CALL THE OWNER OR ADMIN</>);
  //     }
  //     if (veh_grp_ary.dayusemultivehs.count > 0) {
  //       console.log('BAILED ON veh_grp_ary.dayusemultivehs.count > 0)')
  //       return (<> There may be cleaning <br />people in the unit.<br /><br />
  //         You are not allowed to have <br />more day passes than {freepassesallowed}.
  //       </>);
  //     }
  //     if (allActiveCount >= (unitParkingLimit + containsDaypassCount)) {
  //       console.log('BAILED ON allActiveCount >= (unitParkingLimit + containsDaypassCount')
  //       return (<>You are not allowed to have <br />more active vehicles than<br />
  //         your parking allowance: {unitParkingLimit}. <br /><br />
  //         CALL THE OWNER OR ADMIN</>);
  //     }
  //     return null;
  //   };
  
  //  export const showFailureMessage = () => {
  
  //      const messagetoshow = getCreateValidationMessage();
  //     if (messagetoshow !== null) {
  //       setModal({
  //         isOpen: true,
  //         type: "alert",
  //         title: "Validation Error",
  //         message: messagetoshow,
  //         //  message: `Free parking limit reached. Maximum renter free parking spots allowed: ${renterFreeParking}`,
  //         confirmText: "OK",
  //         // cancelText: "Cancel",
  //         onConfirm: () => {
  //           setModal(prev => ({ ...prev, isOpen: false }));
  //         },
  //       });
  //       return null;
  //     }
  
  //   }
  // end form valication




