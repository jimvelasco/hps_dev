

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

// const mongoDateIn = new Date(element.startdate);
// const mongoDateInStr = utcDateOnly(mongoDateIn);
// const mongoDate = new Date(element.enddate);
// const mongoDateStr = utcDateOnly(mongoDate);
  // console.log('returning true *******************************************************',mongoDate,today);
  // console.log('PLATE IS ', element.plate, ' TODAY IS ', today.toISOString().split('T')[0],' VEHICLE CHECKOUT DATE IS ', mongoDate.toISOString().split('T')[0]);
//console.log('plate is', element.plate,'modgodate is ', utcDateOnly(mongoDate), ' today is ', utcDateOnly(today));

  // if (utcDateOnly(mongoDate) >= today.toLocaleDateString("en-CA")) {
  //   return true;
  // } else {
  //   return false;
  // }


   if (mongoDateInStr >= todayStr && mongoDateStr >= todayStr ) {
    //  console.log('getVehicleActiveStatusBoolean rvalue is true',mongoDateInStr,mongoDateStr,todayStr);
    return false;
  } 
  if ( mongoDateStr >= todayStr ) {
    //  console.log('getVehicleActiveStatusBoolean rvalue is true',mongoDateInStr,mongoDateStr,todayStr);
    return true;
  } 

  
  else {
     // console.log('getVehicleActiveStatusBoolean rvalue is false')

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


export const utcDateOnly = (isoStr) => {
  const d = new Date(isoStr);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}

export const formatPhoneNumber = (phone) => {
  phone = phone.replace(/\D/g, '');
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}



export const okToActivateOwnerVehicle = (formvehicle, vehiclearray, role, ownerOfUnit,vehicleId,unit,createdfrom,pincodeAction) => {
  let oktoadd = true
  let rpflag = 0;

  const formedate = formvehicle.enddate;
  const todayStr = new Date().toLocaleDateString("en-CA"); // "2025-12-03"
 // console.log('formedate is ', formedate, ' todayStr is ', todayStr);
//  console.log('okToActivateOwnerVehicle formvehicle, vehiclearray, role, ownerOfUnit,vehicleId,unit,createdfrom,pincodeAction',
//   formvehicle, vehiclearray, role, ownerOfUnit,vehicleId,unit,createdfrom,pincodeAction);

   console.log('okToActivateOwnerVehicle formvehicle.carownertype,role, vehicleId,createdfrom,pincodeAction');
  console.log(formvehicle.carownertype,role, vehicleId,createdfrom,pincodeAction);


  let activeCount = 0;
  let activeArray = [];
  let inactiveArray = [];
   
   
  for (let i = 0; i < vehiclearray.length; i++) {
    const v = vehiclearray[i];
    const isok = getVehicleActiveStatusBoolean(v);
    if (isok) {
      activeArray.push(v);
      activeCount++;
    } else {
      inactiveArray.push(v);
    }
  }
 // console.log('active length is ', activeArray.length, ' inactive length is ', inactiveArray.length );
 // console.log('owner free parking is ', ownerOfUnit.owner_free_parking); 

  let ownerFreeParking = unit.owner_free_parking || 0;
  let filteredActive = [];
  let filteredInActive = [];
  if (vehicleId) {
    filteredActive = activeArray.filter(v => v._id !== vehicleId);
    filteredInActive = inactiveArray.filter(v => v._id !== vehicleId);
     
  }
   let maxallowed = unit.parking_allowed_owner;
 
  if ((activeArray.length) >= maxallowed) {
    if (todayStr > formedate || filteredActive.length == 1) {
      oktoadd = true;
    } else {
      oktoadd = false;
    }
  } else {
    if (activeArray.length == ownerFreeParking) {
      rpflag = 1;
    }
    oktoadd = true;
  }
  return { oktoadd: oktoadd, rpflag: rpflag };
}



export const okToActivateRenterVehicle = (formvehicle, vehiclearray, role, ownerOfUnit, vehicleId,unit,createdfrom,pincodeAction) => {
  const formedate = formvehicle.enddate;

  let activeArray = vehiclearray;
  let activeCount = activeArray.length;
  let filteredActive = [];
  
  console.log('okToActivateRenterVehicle formvehicle.carownertype,role, vehicleId,createdfrom,pincodeAction');
  console.log(formvehicle.carownertype,role, vehicleId,createdfrom,pincodeAction);

  console.log('okToActivateRenterVehicle vehicle array' ,vehiclearray);

  // console.log('okToActivateRenterVehicle called with ownerOfUnit', ownerOfUnit);
  let robj = { oktoadd: true, rpflag: 0 };
  if (!vehicleId) {
    if (activeCount < parseInt(unit.renter_free_parking)) {
     // console.log('RETURNING REQUIRES PAYMENT FALSE');
      robj = { oktoadd: true, rpflag: 0 }
      return robj; //{ oktoadd: true, rpflag: 0 };
    }
    if (unit.renter_free_parking < unit.parking_allowed_renter) {
      robj = { oktoadd: true, rpflag: 1 }
      filteredActive = activeArray.filter(v => parseInt(v.requires_payment) > 0);
      if (filteredActive.length > 0) {
        robj = { oktoadd: true, rpflag: 0 }
      }
      return robj; //{ oktoadd: true, rpflag: 1 };
    }
  } else {
    filteredActive = activeArray.filter(v => v._id === vehicleId);
    const thevehicle = filteredActive[0];
    const rp = thevehicle.requires_payment;
    robj = { oktoadd: true, rpflag: rp }
    return robj; //{ oktoadd: true, rpflag: rp };
  }
   return robj;
}


export const okToAddUnitVehicle = (formvehicle, vehiclearray, role, ownerOfUnit, vehicleId, unit, createdfrom, pincodeAction) => {
  const formedate = formvehicle.enddate;

  //  let activeArray = vehiclearray;

  const todayStr = new Date().toLocaleDateString("en-CA"); 

  let filteredOwnerActive = [];
  let filteredNonOwnerActive = [];
  let filteredOtherActive = [];
  let filteredNonOtherInActive = [];

  let maxactiveallowed = 3;

  let oktoadd = null;

  //let theVehicle = vehiclearray.filter(v => v._id !== vehicleId);

  filteredOwnerActive = vehiclearray.filter(v => v.calculatedActiveFlag === true && v.createdbytype === "owner");
  filteredNonOwnerActive = vehiclearray.filter(v => v.calculatedActiveFlag === false && v.createdbytype === "owner");
  filteredOtherActive = vehiclearray.filter(v => v.calculatedActiveFlag === true && v.createdbytype === "other");
  filteredNonOtherInActive = vehiclearray.filter(v => v.calculatedActiveFlag === false && v.createdbytype === "other");

 

  //let activeCount = filteredActive.length;

  // console.log('okToAddUnitVehicle formvehicle.carownertype,role, vehicleId,createdfrom,pincodeAction');
  // console.log(formvehicle.carownertype,role, vehicleId,createdfrom,pincodeAction);

  // console.log('in vehicles helper owner ACTIVE ', filteredOwnerActive);
  // console.log('in vehicles helper owner NONACTIVE ', filteredNonOwnerActive);
  // console.log('in vehicles helper other ACTIVE ', filteredOtherActive);
  // console.log('in vehicles helper other NONACTIVE ', filteredNonOtherInActive);

  const totalActiveCount = filteredOwnerActive.length + filteredOtherActive.length;
  let ownerFreeParking = unit.owner_free_parking || 0;

  let robj = { oktoadd: true, rpflag: 0,currentVehicle: null };


  if (!vehicleId) {
   // console.log("WE MUST BE A NEW VEHICLE");
  //  if (totalActiveCount < parseInt(unit.renter_free_parking)) {
       if (totalActiveCount > -1)  {
      robj = { oktoadd: true, rpflag: 0,currentVehicle: null }
      return robj; //{ oktoadd: true, rpflag: 0 };
    }
  } else {
   // console.log("WE MUST BE AN EDIT OF AN EXISTING");
     let theCurrentVehicle = vehiclearray.filter(v => v._id === vehicleId);
    if (totalActiveCount >= maxactiveallowed) {
      if (todayStr > formedate || filteredOwnerActive.length == 1) {
        oktoadd = true;
      } else {
        oktoadd = false;
      }
    } else {
      if (filteredOwnerActive.length == ownerFreeParking) {
        rpflag = 1;
      }
      oktoadd = true;
    }

     robj = { oktoadd: true, rpflag: 0,currentVehicle: theCurrentVehicle }

  }





  // if (!vehicleId) {
  //   if (activeCount < parseInt(unit.renter_free_parking)) {
  //     robj = { oktoadd: true, rpflag: 0 }
  //     return robj; //{ oktoadd: true, rpflag: 0 };
  //   }
  //   if (unit.renter_free_parking < unit.parking_allowed_renter) {
  //     robj = { oktoadd: true, rpflag: 1 }
  //     filteredActive = activeArray.filter(v => parseInt(v.requires_payment) > 0);
  //     if (filteredActive.length > 0) {
  //       robj = { oktoadd: true, rpflag: 0 }
  //     }
  //     return robj; //{ oktoadd: true, rpflag: 1 };
  //   }
  // } else {
  //   filteredActive = activeArray.filter(v => v._id === vehicleId);
  //   const thevehicle = filteredActive[0];
  //   const rp = thevehicle.requires_payment;
  //   robj = { oktoadd: true, rpflag: rp }
  //   return robj; //{ oktoadd: true, rpflag: rp };
  // }
   return robj;
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
 


    // if ((filteredActive.length + filteredInActive.length) <= maxallowed) {
    //   return false;
    // }
   // const clickedvehid = formvehicle._id;
    // const clickedvehedate = formvehicle.enddate;
    // console.log('okToActivateVehicle isModifyMode clickedvehid:', clickedvid);
    //  console.log('okToActivateVehicle isModifyMode clickedvehedate:', clickedvehedate);
    
   //return true;
  // console.log('okToActivateVehicle isModifyMode is:', isModifyMode);
  // console.log('okToActivateVehicle activeCount of vehicles is:', activeCount);
  // console.log('okToActivateVehicle called with formvehicle:', formvehicle);
  // console.log('okToActivateVehicle called with vehclearray:', vehiclearray);
  // console.log('okToActivateVehicle called with role:', role);
  // console.log('okToActivateVehicle called with user:', user);
  