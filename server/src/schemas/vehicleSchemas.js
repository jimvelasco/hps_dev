import { z } from 'zod';

export const createVehicleSchema = z.object({
  ownerid: z.string().nullable().optional(),
  unitnumber: z.string().min(1, 'Unit number is required'),
 carownertype: z.string().optional(),
  carowner_fname: z.string().min(1, 'First name is required'),
  carowner_lname: z.string().min(1, 'Last name is required'),
  carownerphone: z.string().min(10, 'Phone number must be at least 10 digits'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  plate: z.string().min(1, 'License plate is required').toUpperCase(),
  plate_state: z.string().min(1, 'Plate state is required').toUpperCase(),
  hoaid: z.string().min(1, 'HOA ID is required'),
  enddate: z.string().min(1, 'End date is required'),
  startdate: z.string().min(1, 'Start date is required'),
  requires_payment: z.number().optional(),
}).transform((data) => ({
  ...data,
  checkin: data.startdate ? new Date(data.startdate).toISOString() : new Date().toISOString(),
  checkout: data.enddate ? new Date(data.enddate).toISOString() : new Date().toISOString()
}));

export const updateVehicleSchema = z.object({
  ownerid: z.string().nullable().optional(),
 unitnumber: z.string().min(1, 'Unit number is required'),
 carownertype: z.string().optional(),
  carowner_fname: z.string().min(1, 'First name is required'),
  carowner_lname: z.string().min(1, 'Last name is required'),
  carownerphone: z.string().min(10, 'Phone number must be at least 10 digits'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  plate: z.string().min(1, 'License plate is required').toUpperCase(),
  plate_state: z.string().min(1, 'Plate state is required').toUpperCase(),
  hoaid: z.string().min(1, 'HOA ID is required'),
  enddate: z.string().min(1, 'End date is required'),
  startdate: z.string().min(1, 'Start date is required'),
  requires_payment: z.number().optional(),
}).transform((data) => ({
  ...data,
  checkin: data.startdate ? new Date(data.startdate).toISOString() : new Date().toISOString(),
  checkout: data.enddate ? new Date(data.enddate).toISOString() : new Date().toISOString()
}));
  // enddate: z.string().refine((value) => {
  //   const date = new Date(value);
  //   if (Number.isNaN(date.getTime())) return false;
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   date.setHours(0, 0, 0, 0);
  //   return date > today;
  // }, {
  //   message: "Date must be greater than today",
  // }),



  //  change_history: z.array(z.unknown()).optional(),
  //  number_of_changes: z.number().optional(),
  // has_read_terms: z.number().optional()

/*
 carowner_fname: response.data.carowner_fname || "",
          carowner_lname: response.data.carowner_lname || "",
          carownerphone: response.data.carownerphone || "",
          //   unitnumber: response.data.unitnumber || "",
          unitnumber: unitNumber || "",
          //  carownertype: response.data.carownertype || "owner",
          carownertype: loggedInUser ? loggedInUser.role : "renter",
          make: response.data.make || "",
          model: response.data.model || "",
          year: response.data.year || "",
          vehicle_type: response.data.vehicle_type || "",
          plate: response.data.plate || "",
          plate_state: response.data.plate_state || "",
          //  active_flag: response.data.active_flag || 0,
          // startdate: response.data.startdate || "",
          startdate: response.data.startdate || "",
          enddate: response.data.enddate || ""

           hoaid: hoaId,
        ownerid: oid,
        carownertype: carownertype,
*/

// export const workingupdateVehicleSchema = z.object({
//   ownerid: z.string().optional(),
//   unitnumber: z.string(),
//   carownertype: z.string(),
//   carownername: z.string().optional(),
//   carowner_fname: z.string().min(1, 'First name is required'),
//   carowner_lname: z.string().min(1, 'Last name is required'),
//   carownerphone: z.string().min(10, 'Phone number must be valid'),
//   make: z.string().min(1, 'Make is required').optional(),
//   model: z.string().min(1, 'Model is required').optional(),
//   year: z.string().min(4, 'Year must be 4 digits').optional(),
//   vehicle_type: z.string().min(1, 'Vehicle type is required').optional(),
//   plate: z.string().min(1, 'License plate is required'),
//   plate_state: z.string().min(1, 'Plate state is required').optional(),
//   hoaid: z.string().optional(),
//   active_flag: z.number().optional(),
//   status_flag: z.number().optional(),
//   enddate: z.string().min(1, 'End date is required'),
//   startdate: z.string().min(1, 'Start date is required'),
//   change_history: z.array(z.unknown()).optional(),
//   number_of_changes: z.number().optional(),
//   has_read_terms: z.number().optional()
// });