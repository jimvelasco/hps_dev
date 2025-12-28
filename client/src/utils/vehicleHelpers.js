export const oldgetVehicleActiveStatusBoolean = (element) => {
  //const mongoDateStr = new Date(element.checkout).toLocaleDateString("en-CA"); // "2025-12-03"
  const todayStr = new Date().toLocaleDateString("en-CA"); // "2025-12-03"

  /*
  function todayUtcMidnight() {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
}

const mongoDate = new Date(doc.startDate);
  */

  // let d = new Date(element.checkout);
  // const y = d.getUTCFullYear();
  // const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  // const day = String(d.getUTCDate()).padStart(2, "0");
  // const mongoDateStr = `${y}-${m}-${day}`; // "YYYY-MM-DD"
  const mongoDateStr = element.enddate;
  //  console.log("")
   // console.log('todayStr=', todayStr,'mongoDateStr=', mongoDateStr, (mongoDateStr >= todayStr));
   // console.log('mongoDateStr=', mongoDateStr); 
  //  console.log('plate=', element.plate);  
  //  console.log('istrue=', (mongoDateStr >= todayStr )); 
  // console.log('');  
  // console.log('getVehicleActiveStatusBoolean',
  //   'indate=', element.checkout,
  //   'mongoDateStr=', mongoDateStr,
  //   'todayStr=', todayStr,
  //   'plate=', element.plate
  // );

  if (mongoDateStr >= todayStr) {
    //console.log('returning true *******************************************************',"");
    return true;
  } else {
    return false;
  }
}

export const getVehicleActiveStatusBoolean = (element) => {
  const now = new Date();
  const today = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
const mongoDate = new Date(element.checkout);
  if (mongoDate >= today) {
    //console.log('returning true *******************************************************',"");
    return true;
  } else {
    return false;
  }
}

export const getVehicleIsActiveTodayBoolean = (element) => {
  const now = new Date();
  const today = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
const mongoDate = new Date(element.checkout);
  if (mongoDate == today) {
    return true;
  } else {
    return false;
  }
}

// {/*
//   function ymdFromMongoUTC(value) {
//   // value may be an ISO string ("2025-12-16T00:00:00.000Z")
//   // or a Date object (new Date(...))
//   const d = (typeof value === "string") ? new Date(value) : value;
//   if (!(d instanceof Date) || isNaN(d)) return null;

//   const y = d.getUTCFullYear();
//   const m = String(d.getUTCMonth() + 1).padStart(2, "0");
//   const day = String(d.getUTCDate()).padStart(2, "0");

//   return `${y}-${m}-${day}`; // "YYYY-MM-DD"
// }
//   *}

// this is true if the vehicle's enddate is exactly today.  Used to highlight which vehicles will be
// leaving today
export const xxxgetVehicleIsActiveTodayBoolean = (element) => {
  // "2025-12-03"
  // let d = new Date(element.checkout);
  // const y = d.getUTCFullYear();
  // const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  // const day = String(d.getUTCDate()).padStart(2, "0");
  //const mongoDateStr = `${y}-${m}-${day}`; // "YYYY-MM-DD"
  const mongoDateStr = element.enddate; // "YYYY-MM-DD"

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
//  let curdate = new Date().toLocaleDateString();
//             let curdatetime = new Date(curdate).getTime(); -432 000 000

// true if vehicle enddate is today or in the future
// export const xxisVehicleActive = (vehicle) => {
//   if (!vehicle?.enddate) return false;
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   return new Date(vehicle.enddate) >= today;
// };

// export const xxgetActiveRenterVehicles = (vehicles) => {
//   return vehicles.filter(
//     (v) => v.carownertype === 'renter' && isVehicleActive(v)
//   );
// };
 //const oktoadd = okToActivateVehicle(formData,vehicles,role,ownerOfUnit);

export const aaokToActivateOwnerVehicle = (formvehicle, vehiclearray, role, ownerOfUnit,vehicleId) => {
  const formedate = formvehicle.enddate;
  let activeCount = 0;
  let activeArray = [];
  let inactiveArray = [];
  // should comment these in at some point
  // console.log('okToActivateVehicle called FORMDATA IS:', formvehicle);
  // console.log('okToActivateVehicle called with role:', role);
  // console.log('okToActivateVehicle called UNIT OWNER IS:', ownerOfUnit);
  // console.log('okToActivateVehicle called VEHICLE ID IS:', vehicleId);

  const todayStr = new Date().toLocaleDateString("en-CA"); // "2025-12-03"
  for (let i = 0; i < vehiclearray.length; i++) {
    const v = vehiclearray[i];
    const isok = getVehicleActiveStatusBoolean(v);
    if (isok) {
     // console.log('just added active')
      activeArray.push(v);
      activeCount++;
    } else {
    //  console.log('just added IN active')
      inactiveArray.push(v);
    }
  }
  console.log('active length is ', activeArray.length, ' inactive length is ', inactiveArray.length );
  let filteredActive = [];
  let filteredInActive = [];
 // console.log('ACTIVE ARRAY IS ', activeArray);
  if (vehicleId) {
    filteredActive = activeArray.filter(v => v._id !== vehicleId);
    filteredInActive = inactiveArray.filter(v => v._id !== vehicleId);
    //  console.log('vehiclearray length is ', vehiclearray.length,activeCount);
    //  console.log('FILTERED ACTIVE ARRAY IS ', filteredActive);
    //   console.log('FILTERED IN ACTIVE ARRAY IS ', filteredInActive);
      return { oktoadd: true, rpflag: 0 };
  }
 // console.log('FILTERED ACTIVE ARRAY LENGTH IS ', filteredActive.length);
   let maxallowed = ownerOfUnit.parking_allowed_owner;
    if ((activeArray.length) >= maxallowed) {
      if (todayStr > formedate) {
        return {oktoadd:true, rpflag: 0};
      } else {
        return {oktoadd:false, rpflag: 0};
      }
    }
  //  console.log('RETURNING NEITHER CONDITION TRUE')
     return {oktoadd:true, rpflag: 0};
}

export const okToActivateOwnerVehicle = (formvehicle, vehiclearray, role, ownerOfUnit,vehicleId) => {
  let oktoadd = true
  let rpflag = 0;

  const formedate = formvehicle.enddate;
  const todayStr = new Date().toLocaleDateString("en-CA"); // "2025-12-03"
  console.log('formedate is ', formedate, ' todayStr is ', todayStr);

  let activeCount = 0;
  let activeArray = [];
  let inactiveArray = [];
   
   
  for (let i = 0; i < vehiclearray.length; i++) {
    const v = vehiclearray[i];
    const isok = getVehicleActiveStatusBoolean(v);
    if (isok) {
     // console.log('just added active')
      activeArray.push(v);
      activeCount++;
    } else {
    //  console.log('just added IN active')
      inactiveArray.push(v);
    }
  }
  console.log('active length is ', activeArray.length, ' inactive length is ', inactiveArray.length );
  console.log('owner free parking is ', ownerOfUnit.owner_free_parking); 
  let ownerFreeParking = ownerOfUnit.owner_free_parking || 0;
  let filteredActive = [];
  let filteredInActive = [];
 // console.log('ACTIVE ARRAY IS ', activeArray);
  if (vehicleId) {
    filteredActive = activeArray.filter(v => v._id !== vehicleId);
    filteredInActive = inactiveArray.filter(v => v._id !== vehicleId);
   
    
    //  if (activeArray.length == 2 && filteredActive[0].requires_payment == 1) {
    //   return { oktoadd: true, rpflag: 0 };
    // }
    // if (activeArray.length == 2 && filteredActive[0].requires_payment == 0) {
    //   return { oktoadd: true, rpflag: 1 };
    // }
    // if (activeArray.length == 1 && filteredActive[0].requires_payment == 1) {
    //   return { oktoadd: true, rpflag: 0 };
    // }
    // if (activeArray.length == 1 && filteredActive[0].requires_payment == 0) {
    //   return { oktoadd: true, rpflag: 1 };
    // }
    // if (activeArray.length == 2 && filteredInActive.length >= 0) {
    //   return { oktoadd: false, rpflag: 0 };
    // }
    //  if (activeArray.length == 0) {
    //   return { oktoadd: true, rpflag: 0 };
    // }
    //  console.log('vehiclearray length is ', vehiclearray.length,activeCount);
    //  console.log('FILTERED ACTIVE ARRAY IS ', filteredActive);
    //   console.log('FILTERED IN ACTIVE ARRAY IS ', filteredInActive);
     
  }
 // console.log('FILTERED ACTIVE ARRAY LENGTH IS ', filteredActive.length);
   let maxallowed = ownerOfUnit.parking_allowed_owner;
  // console.log('max allowed is ', maxallowed,'activeArray length is ', activeArray.length);

  //  if (filteredActive.length == 1) {
  //   console.log('filteredActive length is 1, returning true');
  //   return { oktoadd: true, rpflag: filteredActive[0].requires_payment };
  //  }

  if ((activeArray.length) >= maxallowed) {
    if (todayStr > formedate) {
      oktoadd = true;
    } else {
      oktoadd = false;
    }
  } else {
    console.log('we can now figure out who gets to pay flag ownerFreeParking is ', ownerFreeParking);
    if (activeArray.length == ownerFreeParking) {
      rpflag = 1;
    }
    oktoadd = true;
  }
  return { oktoadd: oktoadd, rpflag: rpflag };
}



export const okToActivateRenterVehicle = (formvehicle, vehiclearray, role, ownerOfUnit, vehicleId) => {
  const formedate = formvehicle.enddate;

  let activeArray = vehiclearray;
  let activeCount = activeArray.length;
  let filteredActive = [];
  if (vehicleId) {
    filteredActive = activeArray.filter(v => v._id === vehicleId);
    const thevehicle = filteredActive[0];
    const rp = thevehicle.requires_payment;
    return { oktoadd: true, rpflag: rp };
  } else {
    if (activeArray.length == 0) {
      return { oktoadd: true, rpflag: 0 };
    }
    if (activeArray.length == 1 && activeArray[0].requires_payment == 1) {
      return { oktoadd: true, rpflag: 0 };
    }
    if (activeArray.length == 1 && activeArray[0].requires_payment == 0) {
      return { oktoadd: true, rpflag: 1 };
    }
  }
}

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
  