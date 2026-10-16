//mongosh "mongodb://localhost:27017"
db.units.updateMany({}, { $unset: { pincodeary: "" } })

db.units.updateMany(
  {},
  { $set: { "pincodeary": [{"pincode":"","action":"standard","expire_date": null, "uses_allowed":-1,"uses_used":0}] }}
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

db.hoas.updateMany(
  {},
  { $set: { "parking_handicapped_hoa": 0 }}
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
 { $set: { "pin_code_action": "standard" }}
);








