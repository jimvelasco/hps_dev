import { useHoa } from "../context/HoaContext";

export const getHoaContactPhoneNumber = (hoa, contactId) => {
  return hoa?.contact_information?.find(contact => contact.contact_id === contactId)?.phone_number ?? null;
};

export const useHoaContactPhoneNumber = (contactId) => {
  const { hoa } = useHoa();
  return getHoaContactPhoneNumber(hoa, contactId);
};
