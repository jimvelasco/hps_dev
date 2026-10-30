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
  { $set: { "parking_allowed_unit": 2 }}
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
 { $set: { "createdbytype": "owner" }}
);


db.vehicles.updateMany(
  {},
 { $set: { "pin_code_value": "" }}
);

db.vehicles.updateMany(
  {},
 { $set: { "pin_code_action": "renter" }}
);








