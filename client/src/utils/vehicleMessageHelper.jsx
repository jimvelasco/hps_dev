import React from "react";
import { getVehicleTypeGroups, getMaxEnddateOfVehicles, getMinStartdateOfVehicles } from "./vehicleHelpers";
import { useHoaContactPhoneNumber,getHoaContactPhoneNumber } from "./hoaHelpers";


export const vehicleMessageHelper = (vehicles, unit, pincodeAction, allActiveCount, containsDaypassCount,hoa) => {
  const unitParkingLimit = Number(unit.parking_allowed_unit);
  const freepassesallowed = Number(unit.daypasses_allowed_owner);
  const veh_grp_ary = getVehicleTypeGroups(vehicles);
  const maxenddateofgroup = getMaxEnddateOfVehicles(veh_grp_ary.nonownervehs.array);
  const minstartdaterenters = getMinStartdateOfVehicles(veh_grp_ary.rentervehs.array);
  const phonetocall =  getHoaContactPhoneNumber(hoa,"pm_renter");
  let overlapbump = 0;
  if (maxenddateofgroup === minstartdaterenters) {
    overlapbump = 1;
  }

  //console.log('overlapbump',overlapbump)

  if (pincodeAction === 'dayuseonly') {
   // console.log('pincodeAction',pincodeAction)
    // if (veh_grp_ary.dayusemultivehs.count > 0) {
    //   return (<>You are not allowed to have <br />more daypassed<br />than allowed: {freepassesallowed}<br /><br />
    //     Call Admin to get an<br />increase in day passes. </>);
    // }
     if (veh_grp_ary.dayusemultivehs.count > 0  ) {
      return (<>You are not allowed more daypasses<br /> than allowed:  {freepassesallowed} <br /> If issues, first contact person that provided <br />
      Unit/PIN or HOA Management <br />{phonetocall}</>);
    }
    return null;
  }

   if (veh_grp_ary.rentervehs.count  >= unitParkingLimit + overlapbump) {
    return (<>You are not allowed more  <br />parking than allowed {unitParkingLimit}.<br />If issues, first contact person that provided <br />
    Unit/PIN or HOA Management.< br />{phonetocall}
    </>);
  }
  if (veh_grp_ary.allactivevehs.count >= unitParkingLimit  + overlapbump) {
    return (<>You are not allowed more parking than allowed:  {unitParkingLimit}< br/> If issues, first contact person that provided 
    <br />Unit/PIN or HOA Management< br/>{phonetocall}</>);
  }
 
  if (veh_grp_ary.ownervehs.count >= unitParkingLimit  + overlapbump) {
    return (<> There may be an owner in the unit.<br />
     If issues, first contact person that provided <br />
    Unit/PIN or HOA Management.< br />{phonetocall}</>);
  }
  if (veh_grp_ary.dayusemultivehs.count > 0 ) {
    return (<> There may be cleaning <br />people in the unit.<br /><br />
      You are not allowed to have <br />more day passes than {freepassesallowed}.
    </>);
  }
  if (allActiveCount >= (unitParkingLimit + overlapbump + containsDaypassCount)) {
    return (<>You are not allowed to have <br />more active vehicles than<br />
      your parking allowance: {unitParkingLimit}. <br /><br />
      CALL THE OWNER OR ADMIN</>);
  }
  return null;
};
