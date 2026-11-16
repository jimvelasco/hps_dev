import { useHoa } from "../context/HoaContext";
import axios from "../services/api";
import { getVehicleActiveStatusBoolean } from "./vehicleHelpers";

export const getHoaContactPhoneNumber = (hoa, contactId) => {
  return hoa?.contact_information?.find(contact => contact.contact_id === contactId)?.phone_number ?? null;
};

export const useHoaContactPhoneNumber = (contactId) => {
  const { hoa } = useHoa();
  return getHoaContactPhoneNumber(hoa, contactId);
};

export const getHoaDayUseOnlyVehicles = async (hoaId) => {
  const response = await axios.get(`/vehicles/allhoaid/${encodeURIComponent(hoaId)}`);
  return response.data.filter(vehicle => vehicle.carownertype === "dayuseonly");
};

export const getHoaActiveDayUseOnlyVehicles = async (hoaId) => {
  const vehicles = await getHoaDayUseOnlyVehicles(hoaId);
  return vehicles.filter(getVehicleActiveStatusBoolean);
};
