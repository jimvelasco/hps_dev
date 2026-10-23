

export const doesUnitHaveDayUsexxx = (unit) => {
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


export const doesUnitHaveDayUse = (unit) => {
   let rval = false;
    if (unit.day_use_only === 1) {
      rval = true;
    }
  return rval;
}



