export const getVehicleActiveStatusBoolean = (element) => {
  //const mongoDateStr = new Date(element.checkout).toLocaleDateString("en-CA"); // "2025-12-03"
  const todayStr = new Date().toLocaleDateString("en-CA"); // "2025-12-03"

  // let d = new Date(element.checkout);
  // const y = d.getUTCFullYear();
  // const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  // const day = String(d.getUTCDate()).padStart(2, "0");
  // const mongoDateStr = `${y}-${m}-${day}`; // "YYYY-MM-DD"
  const mongoDateStr = element.enddate;
  //  console.log("")
  //  console.log('todayStr=', todayStr);
  //  console.log('mongoDateStr=', mongoDateStr); 
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
export const getVehicleIsActiveTodayBoolean = (element) => {
  const todayStr = new Date().toLocaleDateString("en-CA"); // "2025-12-03"
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

export const formatPhoneNumber = (phone) => {
  phone = phone.replace(/\D/g, '');
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}
//  let curdate = new Date().toLocaleDateString();
//             let curdatetime = new Date(curdate).getTime(); -432 000 000

// true if vehicle enddate is today or in the future
export const isVehicleActive = (vehicle) => {
  if (!vehicle?.enddate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(vehicle.enddate) >= today;
};

export const getActiveRenterVehicles = (vehicles) => {
  return vehicles.filter(
    (v) => v.carownertype === 'renter' && isVehicleActive(v)
  );
};
 //const oktoadd = okToActivateVehicle(formData,vehicles,role,ownerOfUnit);

export const okToActivateOwnerVehicle = (formvehicle, vehiclearray, role, ownerOfUnit,vehicleId) => {
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
      activeArray.push(v);
      activeCount++;
    } else {
      inactiveArray.push(v);
    }
  }
  let filteredActive = [];
 // console.log('ACTIVE ARRAY IS ', activeArray);
  if (vehicleId) {
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
 


export const good_okToActivateVehicle = (formvehicle, vehiclearray, role, ownerOfUnit) => {
  const formedate = formvehicle.enddate;
  let activeCount = 0;
  let activeArray = [];
  let inactiveArray = [];
  console.log('okToActivateVehicle called with role:', role,ownerOfUnit);
  const todayStr = new Date().toLocaleDateString("en-CA"); // "2025-12-03"
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
   let maxallowed = ownerOfUnit.parking_allowed_owner;
   if (role === "renter") {
      maxallowed = ownerOfUnit.parking_allowed_renter;
   }
    if ((activeArray.length) >= maxallowed) {
      if (todayStr >formedate) {
        return true;
      } else {
        return false;
      }
    }
    return true;
}
export const yyokToActivateVehicle = (formvehicle, vehiclearray, role, user, isModifyMode, clickedvid) => {
  const formedate = formvehicle.enddate;
  let activeCount = 0;
  let activeArray = [];
  let inactiveArray = [];
  const todayStr = new Date().toLocaleDateString("en-CA"); // "2025-12-03"
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
   const maxallowed = user.parking_allowed_owner;
  if (isModifyMode) {
    if ((activeArray.length) >= maxallowed) {
      if (todayStr >formedate) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
}

export const xxokToActivateVehicle = (formvehicle, vehiclearray, role, user, isModifyMode, clickedvid) => {
  const formedate = formvehicle.enddate;
  let activeCount = 0;
  let activeArray = [];
  let inactiveArray = [];
  const todayStr = new Date().toLocaleDateString("en-CA"); // "2025-12-03"
  // if (todayStr > formedate) {
  //  console.log('pass okToActivateVehicle enddate is in the past:', todayStr,formedate);
  // } else {
  //    console.log('fail okToActivateVehicle enddate is in the future:', todayStr, formedate);
  // }
  

  for (let i = 0; i < vehiclearray.length; i++) {
    const v = vehiclearray[i];
    const isok = getVehicleActiveStatusBoolean(v);
    if (isok) {
      activeArray.push(v);
    } else {
      inactiveArray.push(v);
    }
    if (isok) {
      activeCount++;
    }
  }
  if (isModifyMode) {
    let filteredActive = activeArray.filter(v => v._id === clickedvid);
    let filteredInActive = inactiveArray.filter(v => v._id === clickedvid);
    const maxallowed = user.parking_allowed_owner;
    console.log('okToActivateVehicle isModifyMode filteredActive:', filteredActive.length,filteredActive);
    if ((activeArray.length) >= maxallowed) {
      if (todayStr >formedate) {
         console.log('okToActivateVehicle isModifyMode filteredActive: after filter', filteredActive.length,filteredActive);
        return true;
      }
      return false;
    }
    return true
  }
}
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
  