import User from "../models/User.js";
import jwt from "jsonwebtoken";

const makeParkingPayment = async (req, res) => {
 
  // const { hoaId } = req.query;
  // const filter = hoaId ? { hoaid:hoaId } : {};
  //  console.log("getUsers and hoaId:", hoaId,filter);
  // const users = await User.find(filter);
  const rval = { message: "Parking payment recorded successfully" };
  res.json(rval);
};



export { makeParkingPayment};

