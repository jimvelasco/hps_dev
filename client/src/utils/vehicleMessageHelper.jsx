import React from "react";
import { getVehicleTypeGroups, getMaxEnddateOfVehicles, getMinStartdateOfVehicles } from "./vehicleHelpers";
import { useHoaContactPhoneNumber,getHoaContactPhoneNumber } from "./hoaHelpers";


export const vehicleMessageHelper = (vehicles, unit, pincodeAction, allActiveCount, containsDaypassCount,hoa) => {
  const unitParkingLimit = Number(unit.parking_allowed_unit);
  const daypassesallowed = Number(unit.daypasses_allowed_owner);
  const veh_grp_ary = getVehicleTypeGroups(vehicles);
  console.log('veh_grp_ary.nonownervehs.array',veh_grp_ary.nonownervehs.array)
   console.log('veh_grp_ary.rentervehs.array',veh_grp_ary.rentervehs.array)
  const maxenddateofgroup = getMaxEnddateOfVehicles(veh_grp_ary.nonownervehs.array);
  const minstartdaterenters = getMinStartdateOfVehicles(veh_grp_ary.rentervehs.array);
  const phonetocall =  ""; //getHoaContactPhoneNumber(hoa,"pm_renter");
  let overlapbump = 0;


const formatLocalDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;


  if (maxenddateofgroup === null &&  minstartdaterenters === null) {
    overlapbump = 0;
  } 
  if (maxenddateofgroup !== null &&  minstartdaterenters === null) {
    let todayStr = formatLocalDate(new Date());
    if (maxenddateofgroup === todayStr) {
       overlapbump = 1;
    }
  } 
  
  // if (maxenddateofgroup === minstartdaterenters) {
  //   overlapbump = 1;
  // }

    console.log('maxenddateofgroup',maxenddateofgroup)
    console.log('minstartdaterenters',minstartdaterenters)
    console.log('overlapbump',overlapbump)

  if (pincodeAction === 'dayuseonly') {
     if (veh_grp_ary.dayusemultivehs.count >= daypassesallowed  ) {
      return (<>You are not allowed more daypasses<br /> than allowed:  {daypassesallowed} <br /> If issues, first contact person that provided <br />
      Unit/PIN or HOA Management vv<br />{phonetocall}</>);
    }
    return null;
  }

   if (veh_grp_ary.rentervehs.count  >= unitParkingLimit + overlapbump) {
    return (<>You are not allowed more  <br />parking than allowed {unitParkingLimit}.<br />If issues, first contact person that provided <br />
    Unit/PIN or HOA Managementxx.< br />{phonetocall}
    </>);
  }
  if (veh_grp_ary.allactivevehs.count >= unitParkingLimit  + overlapbump) {
    console.log( 'veh upl overlap',veh_grp_ary.allactivevehs.count,unitParkingLimit,overlapbump)
    return (<>You are not allowed more <br />parking than allowed<br />  {unitParkingLimit}< br/> If issues, first contact the person who provided 
    the Unit/PIN <br />or contact HOA Management.< br/>{phonetocall}</>);
  }
 
  if (veh_grp_ary.ownervehs.count >= unitParkingLimit  + overlapbump) {
    return (<> There may be an owner in the unit.<br />
     If issues, first contact person that provided <br />
    Unit/PIN or HOA Management.bb< br />{phonetocall}</>);
  }
  // if (veh_grp_ary.dayusemultivehs.count > 0 ) {
  //   return (<> There may be cleaning <br />people in the unit.<br /><br />
  //     You are not allowed to have <br />more day passes than {daypassesallowed}.
  //   </>);
  // }
  if (allActiveCount >= (unitParkingLimit + overlapbump + containsDaypassCount)) {
    return (<>You are not allowed to have <br />more active vehicles than<br />
      your parking allowance: {unitParkingLimit}. <br /><br />
      CALL THE OWNER OR ADMIN</>);
  }
  return null;
};
