import React from "react";
import { getVehicleTypeGroups, getMaxEnddateOfVehicles, getMinStartdateOfVehicles } from "./vehicleHelpers";
import { useHoaContactPhoneNumber, getHoaContactPhoneNumber } from "./hoaHelpers";


export const vehicleMessageHelper = (createdfrom, vehicles, unit, pincodeAction, allActiveCount, containsDaypassCount, hoa) => {
  const unitParkingLimit = Number(unit.parking_allowed_unit);
  const daypassesallowed = Number(unit.daypasses_allowed_owner);
  const veh_grp_ary = getVehicleTypeGroups(vehicles);
  // console.log('veh_grp_ary.nonownervehs.array', veh_grp_ary.nonownervehs.array)
  // console.log('veh_grp_ary.rentervehs.array', veh_grp_ary.rentervehs.array)
  const maxenddateofgroup = getMaxEnddateOfVehicles(veh_grp_ary.nonownervehs.array);
  const minstartdaterenters = getMinStartdateOfVehicles(veh_grp_ary.rentervehs.array);
  const phonetocall = ""; //getHoaContactPhoneNumber(hoa,"pm_renter");
  let overlapbump = 0;

 // console.log('vehicleMessageHelper createdfrom',createdfrom)


  const formatLocalDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

 let todayStr = formatLocalDate(new Date());
  if (maxenddateofgroup === null && minstartdaterenters === null) {
    overlapbump = 0;
  }
  if (maxenddateofgroup !== null && minstartdaterenters === null) {
    if (maxenddateofgroup === todayStr) {
      overlapbump = 1;
    }
  }
  // if (maxenddateofgroup === null && minstartdaterenters !== null) {
  //   if (maxenddateofgroup === todayStr) {
  //     overlapbump = 1;
  //   }
  // }

  if (maxenddateofgroup === minstartdaterenters) {
    overlapbump = 1;
  }

  // console.log('maxenddateofgroup', maxenddateofgroup)
  // console.log('minstartdaterenters', minstartdaterenters)
  //  console.log('todayStr', todayStr)
  //  console.log('overlapbump', overlapbump)
  //  console.log('we are here with pincode action',pincodeAction)

  // this gets called from renter vehicles with pincode associated with dayuseonly is used
  if (pincodeAction === 'dayuseonly') {
    if (veh_grp_ary.dayusemultivehs.count >= daypassesallowed) {
      return (<>You are not allowed more <br /> daypasses than allowed<br />  {daypassesallowed} <br /> If issues, first contact person that <br />provided 
        Unit/PIN or HOA Management<br />{phonetocall}</>);
    }
    return null;
  }

// owner vehicles when add vehicle is hit with active daypass
  //  if (veh_grp_ary.dayusemultivehs.count >= daypassesallowed) {
  //     return (<>You are not allowed more <br /> daypasses than allowed<br />  {daypassesallowed} <br /> If issues, first contact person that <br />provided 
  //       Unit/PIN or HOA Management<br />{phonetocall}</>);
  //   }


// message from owner vehicles add vehicle button when renter in unit.  also message appears on other side when str vehicles exceeded
  // if (veh_grp_ary.rentervehs.count >= unitParkingLimit + overlapbump + veh_grp_ary.dayusemultivehs.count) {
  //   return (<>You are not allowed more  <br />parking than allowed {unitParkingLimit}.<br />If issues, first contact person that provided <br />
  //     Unit/PIN or HOA Management.< br />There may be renters in the unit. {phonetocall}
  //   </>);
  // }

// rentervehicles when add button selected and there are two active owner vehicles. 
// we dont have this on the owners side because we don't know what parking type they have picked until there is a form
  if (createdfrom === 'rentervehicles' && veh_grp_ary.allactivevehs.count >= unitParkingLimit + overlapbump + veh_grp_ary.dayusemultivehs.count) {
      return (<>You are not allowed more <br />parking than allowed<br />  {unitParkingLimit}< br /> If issues, first contact the person who provided
        the Unit/PIN <br />or contact HOA Management.< br />{phonetocall}</>);
  }

  //  if (veh_grp_ary.allactivevehs.count >= unitParkingLimit + overlapbump + veh_grp_ary.dayusemultivehs.count) {
  //   if (veh_grp_ary.ownervehs.count > 0) {
  //     return (<>You are not allowed more <br />parking than allowed<br />  {unitParkingLimit}< br /> If issues, first contact the person who provided
  //       the Unit/PIN <br />or contact HOA Management.< br />There may be an owner in the unit.</>);
  //   } else {
  //     return (<>You are not allowed more <br />parking than allowed<br />  {unitParkingLimit}< br /> If issues, first contact the person who provided
  //       the Unit/PIN <br />or contact HOA Managementxx.< br />{phonetocall}</>);
  //   }
  // }

  // if (veh_grp_ary.ownervehs.count >= unitParkingLimit + overlapbump) {
  //   return (<> There may be an owner in the unit.<br />
  //     If issues, first contact person that provided <br />
  //     Unit/PIN or HOA Management.bb< br />{phonetocall}</>);
  // }
  
  // if (allActiveCount >= (unitParkingLimit + overlapbump + containsDaypassCount)) {
  //   return (<>You are not allowed to have <br />more active vehicles than<br />
  //     your parking allowance: {unitParkingLimit}. <br /><br />
  //     CALL THE OWNER OR ADMIN</>);
  // }
  return null;
};
