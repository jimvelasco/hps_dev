//mongosh "mongodb://localhost:27017"
db.units.updateMany(
  {},
  { $set: { "pincodeary": [{"pincode":"","action":"standard"}] }}
);

db.hoas.updateMany(
  {},
  { $set: { "parking_handicapped_hoa": 0 }}
);

