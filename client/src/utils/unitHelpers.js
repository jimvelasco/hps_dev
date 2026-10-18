

export const doesUnitHaveDayUse = (unit) => {
  console.log('doesUnitHaveDayUse unit is',unit);
  let rval = false;
  let pary = unit.pincodeary;
  pary.forEach((el) => {
    if (el.action === "dayuse") {
      rval = true;
    }
  });
 return rval;
}

export const daypassVehicleCount = (vehicles) => {
  console.log('daypassVehicleCount unit',vehicles);
  let cnt = 0;
  vehicles.forEach((el) => {
    if (el.pin_code_action === "dayuse") {
      cnt += 1
    }
  });
 return cnt;
}

