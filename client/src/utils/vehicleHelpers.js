

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

// this is the filter used on OwnerVehicles when in admin mode
export const handleFilterApply = (vehicles, filterType, parkingTypes) => {
  if (filterType === "all" || (filterType !== "dayuseonly" && !parkingTypes?.some(type => type.value === filterType))) {
    return vehicles;
  }
  return vehicles.filter(vehicle => vehicle.carownertype === filterType);
};


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
//  console.log('veh_grp_ary',veh_grp_ary);
//   console.log('vehiclearray',vehiclearray);

  const maxenddateofgroup = getMaxEnddateOfVehicles(veh_grp_ary.nonownervehs.array);
  const minstartdaterenters = getMinStartdateOfVehicles(veh_grp_ary.rentervehs.array);
  const minstartdateofgroup =  getMinStartdateOfVehicles (veh_grp_ary.nonownervehs.array);
  const maxenddaterenters = getMaxEnddateOfVehicles(veh_grp_ary.rentervehs.array);

  

   let overlapbump = 0;
     if (maxenddateofgroup === formsdate) {
     // console.log('GROUP')
      overlapbump = 1;
     } 
      if (minstartdateofgroup === formedate) {
     //   console.log('RENTER')
      overlapbump = 1;
     }
    if (maxenddaterenters === formsdate) {
    //    console.log('owner renter')
      overlapbump = 1;
     }
      if (minstartdaterenters === formedate) {
      overlapbump = 1;
     }
     

  // console.log('maxenddateofgroup',maxenddateofgroup)
  // console.log('minstartdaterenters',minstartdaterenters)
  // console.log('minstartdateofgroup',minstartdateofgroup)
  // console.log('maxenddaterenters',maxenddaterenters)
  // console.log('formsdate',formsdate)
  // console.log('formedate',formedate)
  // console.log('overlapbump',overlapbump)

  // console.log('')

  const todayUTC = new Date(); // "2025-12-03"
  const todayStr = formatLocalDate(todayUTC);
 
  const allActiveVehiclesCount =  veh_grp_ary.allactivevehs.count; //allActiveVehicles.length;

  let maxactiveallowed = unit.parking_allowed_owner;
  let maxdayuse = unit.daypasses_allowed_owner;
  if (localStorage.getItem('logonType') === 'tenant') {
    maxactiveallowed = unit.parking_allowed_tenant;
    maxdayuse = unit.daypasses_allowed_tenant
  }

  let irpflag = 0;
  let dates_span_today = getVehicleActiveStatusBoolean2(formsdate, formedate);  // if dates are equal it will return true if they are today

  let msgType = 0;
  let robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 0 };
  let freeparkinglimit = unit.renter_free_parking;
 // console.log('free parking for unit is', freeparkinglimit);


    // this is run for blank vehicle records (new vehicles)
  // console.log('formvehicle okToAddUnitVehicle either',formvehicle);
    let formdayusecnt = 0;
    if (createdfrom === 'ownervehicles' && formvehicle.day_use_only === 1) {
      formdayusecnt = 1;
    }
    if (createdfrom === 'rentervehicles' && formvehicle.day_use_only === 1) {
      formdayusecnt = 1;
    }

    

     //console.log('overlapbump',overlapbump);
     if (veh_grp_ary.rentervehs.count >= freeparkinglimit) {
      irpflag = 0; // would be 1 if payment implemeted
     }
   
   

/*********************** */
  /* OWNER VEHICLES */
  /*********************** */


  if (createdfrom === 'ownervehicles') {
    if (!vehicleId) {

     //  console.log('ownervehicles dates_span_today',dates_span_today,formdayusecnt,maxdayuse,veh_grp_ary)

      if (!dates_span_today) {
        console.log('dates do not span today');
        console.log('veh_grp_ary.tenantvehsany.count',veh_grp_ary.tenantvehsany.count,formvehicle.carownertype)

        if (formvehicle.carownertype === 'tenant' && veh_grp_ary.tenantvehsany.count >= maxactiveallowed) {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 14 };
          return robj;
        }
        robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 0 };
        return robj;
      }


      if (dates_span_today) {
        if (formdayusecnt === 1) {  //means we passed in a dayuseonly form
          if (veh_grp_ary.dayusemultivehs.count >= maxdayuse ) {
            robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 3 };
            return robj;
          } else {
             robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 0 };
            return robj;
          }
        }
      let tbump = 0;
      if (formvehicle.carownertype === 'tenant') {
         tbump = 1;
      }
       let rbump = 0;
      if (formvehicle.carownertype === 'renter') {
         rbump = 1;
      }
      // THIS DISALLOWS ALL OWNER AND TENANT COLLISIONS based on timber run rules
      //  if (formvehicle.carownertype === 'tenant' && veh_grp_ary.nonownervehs.count > 0) {
      //    robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 12 };
      //    return robj;

      // }
      // let alltypesary = ['owner','family','friend','friend/family','tenant'];
      //  if (alltypesary.includes(formvehicle.carownertype)) {
      //   if (veh_grp_ary.tenantvehs.count > 0 ) {
      //      robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 8 };
      //   return robj;
      //   }
      // }

      // console.log('XX veh_grp_ary.allactivevehs.count',veh_grp_ary.allactivevehs.count)
      // console.log('XX maxactiveallowed',maxactiveallowed)
      // console.log('XX veh_grp_ary.dayusemultivehs.count',veh_grp_ary.dayusemultivehs.count)
      // console.log('XX overlapbump',overlapbump)
      // console.log('XX formdayusecnt',formdayusecnt)
      // console.log('')

       if (formvehicle.carownertype === 'tenant' && veh_grp_ary.tenantvehsany.count >= maxactiveallowed) {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 14 };
          return robj;
        }



        if (veh_grp_ary.allactivevehs.count >= (maxactiveallowed + veh_grp_ary.dayusemultivehs.count + overlapbump)) {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 2 };
          return robj;
        } else {
          console.log('else part of major check olb',overlapbump)
          if (formvehicle.carownertype === 'tenant' && veh_grp_ary.nonownervehs.count > 0) {
            robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 12 };
            return robj;

          }
          if (veh_grp_ary.rentervehs.count > (0 + overlapbump)) {
            robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 6 };
            return robj;
          }
          let alltypesary = ['owner', 'family', 'friend', 'friend/family', 'tenant'];
          if (alltypesary.includes(formvehicle.carownertype)) {
            if (veh_grp_ary.tenantvehs.count > 0 ) {
              robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 8 };
              return robj;
            }
          }

          robj = { oktoadd: true, rpflag: 0, currentVehicle: null, msgType: 0 };
          return robj;
        }
      }


      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 0 };
      return robj;
    }

    //else {

    // VEHICLE ID EXISTS


    let theCurrentVehicleAry = vehiclearray.filter(v => v._id === vehicleId);
    let theCurrentVehicle = theCurrentVehicleAry[0];
    let is_vehicle_active = theCurrentVehicle.calculatedActiveFlag === true;
    let is_day_use_vehicle = theCurrentVehicle.day_use_only === 1;
    const maxdayusemulti = 2;
    let requirespayment = theCurrentVehicle.requires_payment;

    /* START **************************** */
    if (is_vehicle_active && dates_span_today) {
       if (is_day_use_vehicle) {
        if (formvehicle.startdate !== formvehicle.enddate && theCurrentVehicle.multiday === 0) {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 10 };
          return robj;
        }
          robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0};
          return robj;
       }
      // THIS DISALLOWS ALL OWNER AND TENANT COLLISIONS
      let alltypesary = ['owner', 'family', 'friend', 'friend/family', 'tenant'];
      if (alltypesary.includes(theCurrentVehicle.carownertype)) {
        if (veh_grp_ary.tenantvehs.count > 0  && formvehicle.carownertype !== 'tenant') {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 8 };
          return robj;
        }
        if (veh_grp_ary.rentervehs.count > (0 + overlapbump)) {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 6 };
          return robj;
        }
      }
      robj = { oktoadd: true, rpflag: 0, currentVehicle: theCurrentVehicle, msgType: 0 };
      return robj;
    }
     /* END **************************** */


    /* START **************************** */
    if (is_vehicle_active && !dates_span_today) {
       if (is_day_use_vehicle) {
       // console.log('we need to figure this out');
         if (formvehicle.startdate !== formvehicle.enddate  && theCurrentVehicle.multiday === 0) {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 10 };
          return robj;
        }
       }
      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
      return robj;
    }
     /* END **************************** */

    /* START **************************** */
    if (!is_vehicle_active && dates_span_today) {
      if (is_day_use_vehicle) {
         if (formvehicle.startdate !== formvehicle.enddate  && theCurrentVehicle.multiday === 0) {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 10 };
          return robj;
        }
        robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
        if (veh_grp_ary.dayusemultivehs.count >= maxdayuse) {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 3 };
          return robj;
        }
        return robj;
      }
   //   console.log('WE ARE HERE')
   
/*. ALLOW EVERYTHING TO GO THROUGH */
      let alltypesary = ['owner','family','friend','friend/family','tenant'];
      if (alltypesary.includes(theCurrentVehicle.carownertype)) {
        if (veh_grp_ary.tenantvehs.count > 0  && formvehicle.carownertype !== 'tenant') {
           robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 8 };
        return robj;
        }
         if (veh_grp_ary.rentervehs.count > (0 + overlapbump) ) {
           robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 6 };
        return robj;
        }
      }
      // JJVFIX. this should be left in?
      // if (theCurrentVehicle.carownertype === 'tenant' && veh_grp_ary.nonownervehs.count > 0) {
      //    robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 12 };
      //    return robj;
      // }

      

      // console.log('allActiveVehiclesCount',allActiveVehiclesCount)
      // console.log('maxactiveallowed',maxactiveallowed)
      // console.log('veh_grp_ary.dayusemultivehs.count',veh_grp_ary.dayusemultivehs.count)

      if (allActiveVehiclesCount >= maxactiveallowed + veh_grp_ary.dayusemultivehs.count) {
        robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 2 };
        return robj;
      } 
      else {
        robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
        return robj;
      }   
    }
     /* END **************************** */

    /* START **************************** */
    if (!is_vehicle_active && !dates_span_today) {
       if (is_day_use_vehicle) {
         if (formvehicle.startdate !== formvehicle.enddate  && theCurrentVehicle.multiday === 0) {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 10 };
          return robj;
        } 
       }
      //   console.log('THIS IS WHERE')
      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
      return robj;
    }
     /* END **************************** */
  }

  /*********************** */
  /* RENTER VEHICLES */
  /*********************** */


  if (createdfrom === 'rentervehicles') {
    //  console.log('XXX veh_grp_ary.allactivevehs.count',veh_grp_ary.allactivevehs.count)
    //   console.log('XXX maxactiveallowed',maxactiveallowed)
    //   console.log('XXX veh_grp_ary.dayusemultivehs.count',veh_grp_ary.dayusemultivehs.count)
    //   console.log('XXX overlapbump',overlapbump)
    //   console.log('XXX formdayusecnt',formdayusecnt)
    //   console.log('')
   // console.log('formvehicle',formvehicle);

    if (!vehicleId) {
      if (!dates_span_today) {
        robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 0 };
        return robj;
      }

      // this logic was in place when daypasses were created by owner
      // since daypasses are created my()
    //  console.log('dates_span_today',dates_span_today)
      if (dates_span_today) {
        if (formdayusecnt === 1) {  //means we passed in a dayuseonly form
          if (veh_grp_ary.dayusemultivehs.count >= maxdayuse) {
            robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 3 };
            return robj;
          } else {
            robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 0 };
            return robj;
          }
        }

      //  console.log('this is where we are')
        if (veh_grp_ary.nonownervehs.count > (0 + overlapbump)) {
          robj = { oktoadd: false, rpflag: 0, currentVehicle: null, msgType: 11 };
          return robj;
        } 


        if (veh_grp_ary.allactivevehs.count >= (maxactiveallowed + veh_grp_ary.dayusemultivehs.count + overlapbump)) {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: null, msgType: 2 };
          return robj;
        }
        else if (veh_grp_ary.nonownervehs.count > (0 + overlapbump)) {
          robj = { oktoadd: false, rpflag: 0, currentVehicle: null, msgType: 11 };
          return robj;
        } else {
          robj = { oktoadd: true, rpflag: irpflag, currentVehicle: null, msgType: 0 };
          return robj;
        }
      }
    }
    // 

    let theCurrentVehicleAry = vehiclearray.filter(v => v._id === vehicleId);
    let theCurrentVehicle = theCurrentVehicleAry[0];
    let is_vehicle_active = theCurrentVehicle.calculatedActiveFlag === true;
    let is_day_use_vehicle = theCurrentVehicle.day_use_only === 1;
    const maxdayusemulti = 2;
    let requirespayment = theCurrentVehicle.requires_payment;


    if (is_vehicle_active && dates_span_today) {
    // console.log('day use only vacasa room')
      robj = { oktoadd: true, rpflag: 0, currentVehicle: theCurrentVehicle, msgType: 0 };
      return robj;
    }
    if (is_vehicle_active && !dates_span_today) {
      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
      return robj;
    }
    if (!is_vehicle_active && dates_span_today) {
     // console.log('we are here at present')
      let alltypesary = ['owner', 'family', 'friend', 'friend/family', 'tenant'];

      if (alltypesary.includes(theCurrentVehicle.carownertype)) {
        if (veh_grp_ary.tenantvehs.count > 0) {
          robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 8 };
          return robj;
        }
      }

      if (allActiveVehiclesCount >= maxactiveallowed + veh_grp_ary.dayusemultivehs.count) {
        robj = { oktoadd: false, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 2 };
        return robj;
      }
      else {
        robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
        return robj;
      }

    }
    if (!is_vehicle_active && !dates_span_today) {
      robj = { oktoadd: true, rpflag: irpflag, currentVehicle: theCurrentVehicle, msgType: 0 };
      return robj;
    }


}
} // end of okToAddUnitVehicle


export const getVehicleTypeGroups = (vehicles, log = false) => {
  const ownerTypes = ['owner', 'friend', 'family', 'tenant'];
  const todayStr = formatLocalDate(new Date());

  // nonownervehs will include active daypass or multi vehicles
  //const allActiveVehicles = vehiclearray.filter(v => v.calculatedActiveFlag === true);
  const groups = [
    { name: 'rentervehs', matches: v => v.carownertype === 'renter' && v.calculatedActiveFlag === true },
    { name: 'nonownervehs', matches: v => v.carownertype !== 'renter' &&  v.carownertype !== 'dayuseonly' && v.calculatedActiveFlag === true },
    { name: 'nonownervehsany', matches: v => v.carownertype !== 'renter' &&  v.carownertype !== 'dayuseonly'},
    { name: 'ownervehs', matches: v => ownerTypes.includes(v.carownertype) && v.calculatedActiveFlag === true },
    { name: 'dayusevehs', matches: v => v.carownertype === 'dayuseonly' && v.calculatedActiveFlag === true },
    { name: 'dayusevehsany', matches: v => v.carownertype === 'dayuseonly' },
    { name: 'multidayvehs', matches: v => v.carownertype === 'multiday' && v.calculatedActiveFlag === true },
    { name: 'multidayvehsany', matches: v => v.carownertype === 'multiday' },
    { name: 'dayusemultivehs', matches: v => (v.carownertype === 'dayuseonly' || v.carownertype === 'multiday') && v.calculatedActiveFlag === true },
    { name: 'dayusemultivehsany', matches: v => v.carownertype === 'dayuseonly' || v.carownertype === 'multiday' },
    { name: 'allactivevehs', matches: v => v.calculatedActiveFlag === true },
    { name: 'tenantvehsany', matches: v => v.carownertype === 'tenant' },
    { name: 'tenantvehs', matches: v => v.carownertype === 'tenant' && v.calculatedActiveFlag === true },

    { name: 'otherexpiredvehs', matches: v => v.createdbytype === 'other' && ['dayuseonly', 'renter'].includes(v.carownertype) && v.enddate && v.enddate < todayStr }
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




