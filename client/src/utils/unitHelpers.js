

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

