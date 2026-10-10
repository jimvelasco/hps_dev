//mongosh "mongodb://localhost:27017"
db.units.updateMany(
  {},
  { $set: { "pincodeary": [{"pincode":"","action":"standard"}] }}
);

