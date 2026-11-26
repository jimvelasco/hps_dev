//mongosh "mongodb://localhost:27017"

// HOAS

db.hoas.updateMany(
  {},
  { $set: { "daypasses_allowed_hoa": 10 }}
);

db.hoas.updateMany(
  {},
  { $set: { "daypasses_allowed_owner": 1 }}
);
db.hoas.updateMany(
  {},
  { $set: { "parking_allowed_tenant": 2 }}
);
db.hoas.updateMany(
  {},
  { $set: { "tenant_free_parking_spots": 2 }}
);
db.hoas.updateMany(
  {},
  { $set: { "daypasses_allowed_tenant": 0 }}
);
db.hoas.updateMany(
  {},
  { $set: { "daypasses_allowed_renter": 0 }}
);
db.hoas.updateMany(
  {},
  { $set: { "parking_handicapped_hoa": 0 }}
);

db.hoas.updateMany(
  {},
  { $set: { "config_params": {"onsite_button":0,"report_button":0} }}
);

db.hoas.updateMany(
  {},
  { $set: { "parking_types_array": 
    [
      { value: 'owner', label: 'Owner' },
      { value: 'family', label: 'Family' },
      { value: 'friend', label: 'Friend' },
      { value: 'tenant', label: 'Tenant' },
      { value: 'dayuseonly', label: 'Day Pass' }
    ]
  }}
);

// UNITS

db.units.updateMany({}, { $unset: { pincodeary: "" } })

db.units.updateMany(
  {},
  { $set: { "pincodeary": [{"pincode":"","action":"renter","description": "","expire_date": null, "uses_allowed":-1,"uses_used":0}] }}
);

db.units.updateMany(
  {},
  { $set: { "available_for_rent": 1 }}
);

db.units.updateMany(
  {},
  { $set: { "is_resident": 0 }}
);

db.units.updateMany(
  {},
  { $set: { "parking_allowed_owner": 2 }}
);

// units need these

db.units.updateMany(
  {},
  { $set: { "daypasses_allowed_owner": 1 }}
);
db.units.updateMany(
  {},
  { $set: { "parking_allowed_tenant": 2 }}
);
db.units.updateMany(
  {},
  { $set: { "tenant_free_parking_spots": 2 }}
);
db.units.updateMany(
  {},
  { $set: { "daypasses_allowed_tenant": 0 }}
);
db.units.updateMany(
  {},
  { $set: { "daypasses_allowed_renter": 0 }}
);

db.units.updateMany(
  {},
  { $set: { "day_use_only": 0 }}
);


// VEHICLES

db.vehicles.updateMany(
  {},
  { $set: { "day_use_only": 0 }}
);

db.vehicles.updateMany(
  {},
  { $set: { "handicapped": 0 }}
);
db.vehicles.updateMany(
  {},
  { $set: { "multiday": 0 }}
);

db.vehicles.updateMany(
  {},
 { $set: { "createdbytype": "owner" }}
);
db.vehicles.updateMany(
  {},
 { $set: { "company": "" }}
);

db.vehicles.updateMany(
  {},
 { $set: { "createdbyrole": "owner" }}
);


db.vehicles.updateMany(
  {},
 { $set: { "pin_code_value": "" }}
);

db.vehicles.updateMany(
  {},
 { $set: { "pin_code_action": "renter" }}
);

// usefull notes
/*
{ someField: { $exists: false } }


// from server dir
//node scripts/v2scripts/copyUnitPincodes.js
//heroku run node server/scripts/copyUnitPincodes.js -a hoaparking-test

// mongodump --uri "mongodb://localhost:27017/1117_hps_prod" --db="1117_hps_prod" --archive="source.archive"
// mongodump --uri "mongodb://localhost:27017/1125_test_port" --db="1125_test_port" --archive="source.archive2"
// mongorestore --uri "mongodb://localhost:27017/1117_hps_prod" --archive="source.archive" --nsFrom="1117_hps_prod.*" --nsTo="1117_hps_prod_2.*"

/*

good

 mongodump --uri "mongodb://localhost:27017/1125_test_port_2" --db="1125_test_port_2" --archive="source.archive3"
 mongorestore --uri "mongodb+srv://velasco_admin_user:L1ttlewin@cluster0.mui6y.mongodb.net/hps_dev" --archive="source.archive3" 
 --nsInclude="1125_test_port_2.*" --nsFrom="1125_test_port_2.*" --nsTo="hps_dev_v2.*"

mongodump --uri="<HPS_DEV_ATLAS_URI>" \
  --db="hps_dev" \
  --archive="$HOME/Downloads/hps_dev.archive"

mongosh "<HPS_PROD_ATLAS_URI>" --eval 'db.dropDatabase()'

mongorestore --uri="<HPS_PROD_ATLAS_URI>" \
  --archive="$HOME/Downloads/hps_dev.archive" \
  --nsFrom="hps_dev.*" \
  --nsTo="hps_prod.*"

*/






