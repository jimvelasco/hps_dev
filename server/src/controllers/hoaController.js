import Hoa from "../models/Hoa.js";

const getHoaById = async (req, res) => {
  try {
    const { id } = req.params;
   // console.log("Received request for HOA ID:", id);
    //const hoa = await Hoa.findById(id);
    const qry = { hoaid: id };
     const hoa = await Hoa.findOne(qry);
    if (!hoa) {
      return res.status(404).json({ message: "HOA not found" });
    }
    //console.log("Fetched HOA:", hoa);
    res.json(hoa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHoas = async (req, res) => {
  try {
    const hoas = await Hoa.find();
    res.json(hoas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateHoaById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
  //  console.log("Update HOA data received:", id,updateData);
    
    if (updateData.payment_ranges) {
      updateData.payment_ranges = updateData.payment_ranges.map(range => ({
        startDayMo: range.startDayMo,
        endDayMo: range.endDayMo,
        rate: range.rate,
        description: range.description
      }));
    }

    if (updateData.contact_information) {
      updateData.contact_information = updateData.contact_information.map(contact => ({
        contact_id: contact.contact_id,
        phone_number: contact.phone_number,
        phone_description: contact.phone_description,
        email: contact.email,
        display_category: contact.display_category
      }));
    }
    
    const hoa = await Hoa.findOneAndUpdate(
      { hoaid: id },
      updateData,
      { new: true }
    );
    
    if (!hoa) {
      return res.status(404).json({ message: "HOA not found" });
    }
    
    res.json(hoa);
  } catch (error) {
    console.error("Update HOA error:", error);
    res.status(500).json({ message: error.message });
  }
};

export { getHoaById, getHoas, updateHoaById };
