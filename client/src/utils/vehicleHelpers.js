

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
const mongoDate = new Date(element.checkout);
const mongoDateStr = utcDateOnly(mongoDate);
  // console.log('returning true *******************************************************',mongoDate,today);
  // console.log('PLATE IS ', element.plate, ' TODAY IS ', today.toISOString().split('T')[0],' VEHICLE CHECKOUT DATE IS ', mongoDate.toISOString().split('T')[0]);
//console.log('plate is', element.plate,'modgodate is ', utcDateOnly(mongoDate), ' today is ', utcDateOnly(today));

  // if (utcDateOnly(mongoDate) >= today.toLocaleDateString("en-CA")) {
  //   return true;
  // } else {
  //   return false;
  // }
   if (mongoDateStr >= todayStr) {
    return true;
  } else {
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
 // console.log('active length is ', activeArray.length, ' inactive length is ', inactiveArray.length );
 // console.log('owner free parking is ', ownerOfUnit.owner_free_parking); 
  let ownerFreeParking = ownerOfUnit.owner_free_parking || 0;
  let filteredActive = [];
  let filteredInActive = [];
 // console.log('ACTIVE ARRAY IS ', activeArray);
  if (vehicleId) {
    filteredActive = activeArray.filter(v => v._id !== vehicleId);
    filteredInActive = inactiveArray.filter(v => v._id !== vehicleId);
     
  }
   let maxallowed = ownerOfUnit.parking_allowed_owner;
 
  if ((activeArray.length) >= maxallowed) {
    if (todayStr > formedate || filteredActive.length == 1) {
      oktoadd = true;
    } else {
      oktoadd = false;
    }
  } else {
  //  console.log('we can now figure out who gets to pay flag ownerFreeParking is ', ownerFreeParking);
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
    if (activeArray.length == 1 && (activeArray[0].requires_payment == 1 || activeArray[0].requires_payment == 2)) {
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
  