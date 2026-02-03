import { z } from 'zod';

export const updateUserDetailsSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  unitnumber: z.string().min(1, 'Unit number is required'),
  bedrooms: z.number().min(1, 'Bedrooms is required'),
  role: z.string().optional(),
  pincode: z.string().min(1, 'Pincode is required').optional(),
  inventory_allowed_owner: z.number().min(1, 'Inventory allowed owner is required'),
  parking_allowed_renter: z.number().min(1, 'Parking allowed renter is required'),
  parking_allowed_owner: z.number().min(1),
  owner_free_parking: z.number().min(1),
  renter_free_parking: z.number().min(1),
  hoaid: z.string().optional(),
  company: z.string().optional(),
});
export const updateUserProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  pincode: z.string().min(1, 'Pincode is required').optional(),
});

/*
bedrooms: z.coerce.number({
  required_error: "Bedrooms is required",
  invalid_type_error: "Bedrooms is required",
}).min(1, "Bedrooms is required"),
*/
