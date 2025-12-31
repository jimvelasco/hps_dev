

export const getVehicleActiveStatusBoolean = (element) => {
  const today = new Date(); // "2025-12-03"
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
  // console.log('returning true *******************************************************',mongoDate,today);
  // console.log('PLATE IS ', element.plate, ' TODAY IS ', today.toISOString().split('T')[0],' VEHICLE CHECKOUT DATE IS ', mongoDate.toISOString().split('T')[0]);
//console.log('plate is', element.plate,'modgodate is ', utcDateOnly(mongoDate), ' today is ', utcDateOnly(today));

  if (utcDateOnly(mongoDate) >= today.toLocaleDateString("en-CA")) {
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
  if (utcDateOnly(mongoDate) == today.toLocaleDateString("en-CA")) {
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
  