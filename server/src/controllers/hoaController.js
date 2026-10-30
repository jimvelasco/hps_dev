import Hoa from "../models/Hoa.js";
import User from "../models/User.js";
import Unit from "../models/Unit.js";
import { stripe } from "../config/stripe.js";

const getHoaById = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log("Received request for HOA ID:", id);
    //const hoa = await Hoa.findById(id);
    const qry = { hoaid: id };
    const hoa = await Hoa.findOne(qry);
    if (!hoa) {
      return res.status(404).json({ message: "HOA not found" });
    }
    //console.log("Fetched HOA:", hoa);
    res.json(hoa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hps_dev");


// for demo this got all of the hoas including LODGE and TIMBERS to show different backgrounds
const getHoas = async (req, res) => {
  let curl = process.env.CLIENT_URL;
  // we get it from the environmental variable
  //  console.log('getHoas client url',    curl );
  let qry = {};
  if (curl === 'hoaparkingsolutions.com') {
    qry = { hoaid: "YV" }
  }
  try {
    const hoas = await Hoa.find(qry);
    res.json(hoas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FOR NOW WE JUST GET YAMPA VIEW
const getYVHoas = async (req, res) => {
  const qry = { hoaid: "YV" }
  try {
    const hoas = await Hoa.find(qry);
    // console.log('hoa',hoas)
    res.json(hoas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateHoaById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    console.log("Update HOA data received:", id, updateData);

    if (updateData.payment_ranges) {
      updateData.payment_ranges = updateData.payment_ranges.map(range => ({
        startDayMo: range.startDayMo,
        endDayMo: range.endDayMo,
        rate: range.rate,
        rate_2nd: range.rate_2nd,
        description: range.description
      }));
    }

    if (updateData.contact_information) {
      updateData.contact_information = updateData.contact_information.map(contact => ({
        contact_id: contact.contact_id,
        phone_number: contact.phone_number,
        phone_description: contact.phone_description,
        email: contact.email,
        display_category: contact.display_category
      }));
    }

    const hoa = await Hoa.findOneAndUpdate(
      { hoaid: id },
      updateData,
      { new: true }
    );

    if (!hoa) {
      return res.status(404).json({ message: "HOA not found" });
    }

    res.json(hoa);
  } catch (error) {
    console.error("Update HOA error:", error);
    res.status(500).json({ message: error.message });
  }
};

const createStripeConnectAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const hoa = await Hoa.findOne({ hoaid: id });

    if (!hoa) {
      return res.status(404).json({ message: "HOA not found" });
    }

    let accountId = hoa.stripeAccountId;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          hoaid: hoa.hoaid,
          hoaName: hoa.name
        }
      });
      accountId = account.id;
      hoa.stripeAccountId = accountId;
      await hoa.save();
    } else {
      // If account exists, ensure the capabilities are requested
      await stripe.accounts.update(accountId, {
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        }
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.CLIENT_URL}/${hoa.hoaid}/hoa-settings?stripe_onboarding=refresh`,
      return_url: `${process.env.CLIENT_URL}/${hoa.hoaid}/hoa-settings?stripe_onboarding=success`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("Create Stripe Connect Account error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getStripeAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const hoa = await Hoa.findOne({ hoaid: id });

    if (!hoa || !hoa.stripeAccountId) {
      return res.json({ onboardingComplete: false });
    }

    const account = await stripe.accounts.retrieve(hoa.stripeAccountId);

    // Check if transfers capability is active
    const transfersActive = account.capabilities && account.capabilities.transfers === 'active';

    // Onboarding is only truly "complete" for our purposes if they've submitted details
    // AND the transfers capability is active (so we can do destination charges)
    const isFullyReady = account.details_submitted && transfersActive;

    if (isFullyReady && !hoa.stripeOnboardingComplete) {
      hoa.stripeOnboardingComplete = true;
      await hoa.save();
    } else if (!isFullyReady && hoa.stripeOnboardingComplete) {
      // If for some reason they become restricted again, update our record
      hoa.stripeOnboardingComplete = false;
      await hoa.save();
    }

    res.json({
      onboardingComplete: isFullyReady,
      details_submitted: account.details_submitted,
      transfers_active: transfersActive,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements: account.requirements?.currently_due || []
    });
  } catch (error) {
    console.error("Get Stripe Account Status error:", error);
    res.status(500).json({ message: error.message });
  }
};

const importHOAUserCSV_full = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please select a CSV file" });
  }

  const hoaid = req.params.id;
  console.log('the hoaid is', hoaid);
  let hoa;
  try {
    hoa = await Hoa.findOne({ hoaid });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  if (!hoa) {
    return res.status(404).json({ message: "HOA not found" });
  }

  // console.log('The hoa is', hoa)

  /*  hoa                           unit
      parking_allowed_hoa: 47,
[0]   parking_allowed_unit: 3,
      parking_allowed_renter: 2,
[0]   renter_free_parking_spots: 2,renter_free_parking
[0]   owner_free_parking_spots: 2, owner_free_parking
      parking_allowed_owner: 2,
[0]   daypasses_allowed_owner: 1,
[0]   parking_allowed_tenant: 2,
[0]   tenant_free_parking_spots: 2,
[0]   daypasses_allowed_tenant: 0,
[0]   daypasses_allowed_renter: 0
                                    hoaid,unitnumber,bedrooms

  await Unit.create({
  hoaid,
  unitnumber,
  pincodeary: [{
    pincode,
    action: "standard",
    uses_allowed: -1,
    uses_used: 0,
    expire_date: ""
  }]
});


  */

  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  const csv = req.file.buffer.toString("utf8").replace(/^\uFEFF/, "");

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      row.push(value);
      if (row.some((field) => field.trim())) rows.push(row);
      row = [];
      value = "";
      if (character === "\r" && csv[index + 1] === "\n") index += 1;
    } else {
      value += character;
    }
  }

  if (quoted) {
    return res.status(400).json({ message: "CSV contains an unclosed quoted field" });
  }

  row.push(value);
  if (row.some((field) => field.trim())) rows.push(row);
  if (!rows.length) {
    return res.status(400).json({ message: "CSV file is empty" });
  }

  const [headers, ...records] = rows;
  if (records.some((record) => record.length !== headers.length)) {
    return res.status(400).json({ message: "CSV row has a different number of fields than the header" });
  }

  // for (const record of records.slice(0, 5)) {
  //   const output = Object.fromEntries(headers.map((header, index) => {
  //     const column = header.trim();
  //     let field = record[index];
  //     if (column.toLowerCase() === "password") {
  //       field = "[REDACTED]";
  //     } else if (column.toLowerCase() === "phone") {
  //       field = field.split(",")[0].trim().replace(/^Phone:\s*/i, "");
  //     } else if (column.toLowerCase() === "emails") {
  //       field = field.split(/[,;]/)[0].trim().replace(/^Email:\s*/i, "");
  //     }
  //     return [column, field];
  //   }));
  //   console.log(output);
  // }

  let oary = [];
  for (const record of records.slice(0, 5)) {
    //  for (const record of records) {
    const output = Object.fromEntries(headers.map((header, index) => {
      const column = header.trim();
      let field = record[index];
      if (column.toLowerCase() === "phone") {
        field = field.split(",")[0].trim().replace(/^Phone:\s*/i, "");
      } else if (column.toLowerCase() === "emails") {
        field = field.split(/[,;]/)[0].trim().replace(/^Email:\s*/i, "");
        // } else if (column.toLowerCase() === "name") {
        //   field = field.split(/[,;]/)[0].trim().replace(/^Name:\s*/i, "");
      }
      return [column, field];
    }));
    console.log(output);
    oary.push(output)
  }
  console.log('oary size', oary.length)
  let fname = "";
  let lname = "";
  let phone = "";
  let email = "";
  let unitnum = "";
  let hoid = "";
  oary.forEach((el) => {
    let parts = el.Name.split(",");
    lname = parts[0];
    fname = parts[1];
    phone = el.Phone;
    email = el.Emails;
    unitnum = el.Unit;

    console.log(hoaid, unitnum, lname, fname, phone, email);
    console.log();

  })

  let parking_allowed_unit = hoa['parking_allowed_unit'];

  let parking_allowed_owner = hoa['parking_allowed_owner'];
  let owner_free_parking_spots = hoa['owner_free_parking_spots'];
  let daypasses_allowed_owner = hoa['daypasses_allowed_owner'];

  let parking_allowed_tenant = hoa['parking_allowed_tenant'];
  let tenant_free_parking_spots = hoa['tenant_free_parking_spots'];
  let daypasses_allowed_tenant = hoa['daypasses_allowed_tenant'];

  let parking_allowed_renter = hoa['parking_allowed_renter'];
  let renter_free_parking_spots = hoa['renter_free_parking_spots'];
  let daypasses_allowed_renter = hoa['daypasses_allowed_renter'];

  console.log('parking_allowed_unit', parking_allowed_unit);

  console.log('parking_allowed_owner', parking_allowed_owner);
  console.log('owner_free_parking_spots', owner_free_parking_spots);
  console.log('daypasses_allowed_owner', daypasses_allowed_owner);

  console.log('parking_allowed_tenant', parking_allowed_tenant);
  console.log('tenant_free_parking_spots', tenant_free_parking_spots);
  console.log('daypasses_allowed_tenant', daypasses_allowed_tenant);

  console.log('parking_allowed_renter', parking_allowed_renter);
  console.log('renter_free_parking_spots', renter_free_parking_spots);
  console.log('daypasses_allowed_renter', daypasses_allowed_renter);
  let phoaid = hoaid + 'x';



  try {
    unit = await Unit.create({
      hoaid: phoaid,
      unitnumber: unitnum,
      parking_allowed_unit: parking_allowed_unit,


      pincodeary: [{
        pincode: unitnum + 'PIN',
        action: "standard",
        uses_allowed: -1,
        uses_used: 0,
        expire_date: ""
      }]
    });


  } catch (error) {
    console.error(
      `User creation failed; Unit ${unit.unitnumber} remains`,
      error
    );
  }

}

const checkCsvFileFormatOk = (csvfile) => {
  let value = "";
  let quoted = false;
   for (let index = 0; index < csvfile.length; index += 1) {
    const character = csvfile[index];
    if (character === '"') {
      if (quoted && csvfile[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      row.push(value);
      if (row.some((field) => field.trim())) rows.push(row);
      row = [];
      value = "";
      if (character === "\r" && csv[index + 1] === "\n") index += 1;
    } else {
      value += character;
    }
  }
  return quoted;

}

const importHOAUserCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please select a CSV file" });
  }

  const hoaid = req.params.id;
  console.log('the hoaid is', hoaid);
  let hoa;
  try {
    hoa = await Hoa.findOne({ hoaid });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  if (!hoa) {
    return res.status(404).json({ message: "HOA not found" });
  }



  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  const csv = req.file.buffer.toString("utf8").replace(/^\uFEFF/, "");
 // quoted = checkCsvFileFormatOk(csv);

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      row.push(value);
      if (row.some((field) => field.trim())) rows.push(row);
      row = [];
      value = "";
      if (character === "\r" && csv[index + 1] === "\n") index += 1;
    } else {
      value += character;
    }
  }

  if (quoted) {
    return res.status(400).json({ message: "CSV contains an unclosed quoted field" });
  }

  row.push(value);
  if (row.some((field) => field.trim())) rows.push(row);
  if (!rows.length) {
    return res.status(400).json({ message: "CSV file is empty" });
  }

  const [headers, ...records] = rows;
  if (records.some((record) => record.length !== headers.length)) {
    return res.status(400).json({ message: "CSV row has a different number of fields than the header" });
  }


  let oary = [];
  //for (const record of records.slice(0, 3)) {
    for (const record of records) {
    const output = Object.fromEntries(headers.map((header, index) => {
      const column = header.trim();
      let field = record[index];
      if (column.toLowerCase() === "phone") {
        field = field.split(",")[0].trim().replace(/^Phone:\s*/i, "");
      } else if (column.toLowerCase() === "emails") {
        field = field.split(/[,;]/)[0].trim().replace(/^Email:\s*/i, "");
        // } else if (column.toLowerCase() === "name") {
        //   field = field.split(/[,;]/)[0].trim().replace(/^Name:\s*/i, "");
      }
      return [column, field];
    }));
    const [lastName = "", firstName = ""] = (output.Name || "").split(",", 2);
    output.last_name = lastName.trim();
    output.first_name = firstName.trim();
    console.log(output);
    oary.push(output)
  }
  console.log('oary size', oary.length)
  let fname = "";
  let lname = "";
  let phone = "";
  let email = "";
  let unitnum = "";
  let hoid = "";
  oary.forEach((el) => {
    let parts = (el.Name || "").split(",");
    lname = parts[0];
    fname = parts[1];
    phone = el.Phone;
    email = el.Emails;
    unitnum = el.Unit;

    console.log(hoaid, unitnum, lname, fname, phone, email);
    console.log();

  })

  let parking_allowed_unit = hoa['parking_allowed_unit'];

  let parking_allowed_owner = hoa['parking_allowed_owner'];
  let owner_free_parking_spots = hoa['owner_free_parking_spots'];
  let daypasses_allowed_owner = hoa['daypasses_allowed_owner'];

  let parking_allowed_tenant = hoa['parking_allowed_tenant'];
  let tenant_free_parking_spots = hoa['tenant_free_parking_spots'];
  let daypasses_allowed_tenant = hoa['daypasses_allowed_tenant'];

  let parking_allowed_renter = hoa['parking_allowed_renter'];
  let renter_free_parking_spots = hoa['renter_free_parking_spots'];
  let daypasses_allowed_renter = hoa['daypasses_allowed_renter'];

  // console.log('parking_allowed_unit', parking_allowed_unit);

  // console.log('parking_allowed_owner', parking_allowed_owner);
  // console.log('owner_free_parking_spots', owner_free_parking_spots);
  // console.log('daypasses_allowed_owner', daypasses_allowed_owner);

  // console.log('parking_allowed_tenant', parking_allowed_tenant);
  // console.log('tenant_free_parking_spots', tenant_free_parking_spots);
  // console.log('daypasses_allowed_tenant', daypasses_allowed_tenant);

  // console.log('parking_allowed_renter', parking_allowed_renter);
  // console.log('renter_free_parking_spots', renter_free_parking_spots);
  // console.log('daypasses_allowed_renter', daypasses_allowed_renter);

  const unitIndex = headers.findIndex((header) => header.trim().toLowerCase() === "unit");
  if (unitIndex === -1 || !records.length) {
    return res.status(400).json({ message: "CSV must include a Unit column and at least one row" });
  }
  if (oary.some(({ Role }) => !Role?.trim())) {
    return res.status(400).json({ message: "CSV must include a Role for every row" });
  }

  //const unitNumbers = records.slice(0, 3).map((record) => record[unitIndex].trim());
   const unitNumbers = records.map((record) => record[unitIndex].trim());
  if (unitNumbers.some((unitnumber) => !unitnumber)) {
    return res.status(400).json({ message: "Every CSV row must include a Unit" });
  }
  if (oary.some(({ Name }) => !Name?.trim())) {
    return res.status(400).json({ message: "Every CSV row must include a Name" });
  }

  const phoaid = hoaid; // + 'x';
  const units = [];
  let createdUsers = 0;
  let skipped = 0;
  let currentUnitNumber;
  let unitCreatedWithoutUser = false;

  try {
    for (const [index, unitnumber] of unitNumbers.entries()) {
      currentUnitNumber = unitnumber;
      unitCreatedWithoutUser = false;
      const { first_name, last_name, Phone, Emails, Role } = oary[index];
      if (Emails && await User.findOne({ hoaid: phoaid, email: Emails })) {
        console.log('WE ARE SKIPPING A RECORD ',phoaid,Emails);
        skipped += 1;
        continue;
      }

      const unit = await Unit.create({
        hoaid: phoaid,
        unitnumber,
        parking_allowed_unit: parking_allowed_unit,

        parking_allowed_owner: parking_allowed_owner,
        owner_free_parking: owner_free_parking_spots,
        daypasses_allowed_owner: daypasses_allowed_owner,

        parking_allowed_tenant: parking_allowed_tenant,
        tenant_free_parking_spots: tenant_free_parking_spots,
        daypasses_allowed_tenant: daypasses_allowed_tenant,

        parking_allowed_renter: parking_allowed_unit,
        renter_free_parking: renter_free_parking_spots,
        daypasses_allowed_renter: daypasses_allowed_renter,

        pincodeary: [{
          pincode:  unitnumber + 'str',
          action: "renter",
          description: "short term renter",
          uses_allowed: -1,
          uses_used: 0,
          expire_date: ""
        },
        {
          pincode:  unitnumber + 'duo',
          action: "dayuseonly",
          description: "day use only",
          uses_allowed: -1,
          uses_used: 0,
          expire_date: ""
        }
      ]
      });
      units.push(unit);
      unitCreatedWithoutUser = true;

      await User.create({
        hoaid: phoaid,
        unitnumber: unit.unitnumber,
        name: `${first_name} ${last_name}`.trim(),
        first_name,
        last_name,
        phone: Phone,
        email: Emails,
        role: Role.trim(),
        password:  unitnumber + 'pw'
      });
      createdUsers += 1;
      unitCreatedWithoutUser = false;
    }
    return res.status(201).json({ message: `Created ${units.length} units and ${createdUsers} users. Skipped ${skipped} existing users.`, units, createdUsers, skipped });
  } catch (error) {
    console.error(`Import failed for unit ${currentUnitNumber}:`, error);
    const orphanMessage = unitCreatedWithoutUser ? " The most recent Unit remains without a User." : "";
    return res.status(500).json({ message: `Import failed after creating ${units.length} units and ${createdUsers} users.${orphanMessage}`, units, createdUsers, skipped });
  }
};



export { getHoaById, getHoas, updateHoaById, createStripeConnectAccount, getStripeAccountStatus, importHOAUserCSV };



// try {
//   unit = await Unit.create({
//     hoaid:phoaid,
//     unitnumber:unitnum,
//     parking_allowed_unit:parking_allowed_unit,


//     pincodeary: [{
//       pincode:unitnum + 'PIN',
//       action: "standard",
//       uses_allowed: -1,
//       uses_used: 0,
//       expire_date: ""
//     }]
//   });

// const user = await User.create({
//   hoaid,
//   unitnumber: unit.unitnumber,
//   first_name: fname,
//   last_name: lname,
//   email,
//   phone,
//   password
// });

//console.log(`Created Unit ${unit.unitnumber} and User ${user._id}`);
//  console.log(`Created Unit ${unit.unitnumber}`);

// } catch (error) {
//   console.error(
//     unit
//       ? `User creation failed; Unit ${unit.unitnumber} remains`
//       : `Unit creation failed for ${unitnumber}`,
//     error
//   );
// }

// } catch (error) {
//   console.error(
//      `User creation failed; Unit ${unit.unitnumber} remains`,
//     error
//   );
// }










/*
 parking_allowed_unit: 3,
 parking_allowed_renter: 2,
[0]   renter_free_parking_spots: 2,renter_free_parking
[0]   owner_free_parking_spots: 2, owner_free_parking
 parking_allowed_owner: 2,
[0]   daypasses_allowed_owner: 1,
[0]   parking_allowed_tenant: 2,
[0]   tenant_free_parking_spots: 2,
[0]   daypasses_allowed_tenant: 0,
[0]   daypasses_allowed_renter: 0
*/


// console.log('FIRST',fname);
// console.log('LAST',lname);


// console.log('PHONE',el.Phone);
// console.log('EMAIL',el.Emails);
// console.log('UNIT',el.Unit);
// console.log();







//      } else if (["email", "emails"].includes(column.toLowerCase())) {

/*
let unit;

try {
  unit = await Unit.create({
    hoaid,
    unitnumber,
    pincodeary: [{
      pincode,
      action: "standard",
      uses_allowed: -1,
      uses_used: 0,
      expire_date: ""
    }]
  });

  const user = await User.create({
    hoaid,
    unitnumber: unit.unitnumber,
    first_name: fname,
    last_name: lname,
    email,
    phone,
    password
  });

  console.log(`Created Unit ${unit.unitnumber} and User ${user._id}`);
} catch (error) {
  console.error(
    unit
      ? `User creation failed; Unit ${unit.unitnumber} remains`
      : `Unit creation failed for ${unitnumber}`,
    error
  );
}
*/
