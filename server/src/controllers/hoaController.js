import Hoa from "../models/Hoa.js";
import { squareClient } from "../config/square.js";

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

const initiateSquareAuth = async (req, res) => {
  try {
    const { id } = req.params;
    const { sandbox } = req.query; // e.g. YV_sandbox
    
    const clientId = process.env.SQUARE_APPLICATION_ID;
    // const baseUrl = process.env.SQUARE_ENVIRONMENT === "production" 
    //   ? "https://connect.squareup.com" 
    //   : "https://connect.squareupsandbox.com";

     const baseUrl = process.env.SQUARE_ENVIRONMENT === "production" 
      ? "https://squareup.com" 
      : "https://squareupsandbox.com";
    
    // Scopes needed for payments and merchant info
    const scopes = [
      "PAYMENTS_WRITE",
      "PAYMENTS_READ",
      "MERCHANT_READ",
      "OFFLINE_ACCESS"
    ];
    
    const state = id; //JSON.stringify({ hoaid: id, sandbox });
   //const authUrl = `${baseUrl}/oauth2/authorize?client_id=${clientId}&scope=${scopes.join("+")}&state=${state}`;
   // const authUrl = `${baseUrl}/oauth2/authorize?client_id=${clientId}&scope=${scopes.join("+")}&state=${encodeURIComponent(state)}`;
   const authUrl = `${baseUrl}/oauth2/authorize?client_id=${clientId}&scope=${scopes.join("+")}&state=${encodeURIComponent(state)}&session=false`;
 
   console.log('*************** authUrl', authUrl)
    res.json({ authUrl });
  } catch (error) {
    console.error("Initiate Square Auth error:", error);
    res.status(500).json({ message: error.message });
  }
};

const squareOAuthCallback = async (req, res) => {
  try {
    const { code, state } = req.body;
    if (!code || !state) {
      return res.status(400).json({ message: "Code and state are required" });
    }

    const { hoaid, sandbox } = JSON.parse(state);
    
    const response = await squareClient.oauthApi.obtainToken({
      code,
      clientId: process.env.SQUARE_APPLICATION_ID,
      clientSecret: process.env.SQUARE_APPLICATION_SECRET,
      grantType: "authorization_code"
    });

    const { accessToken, refreshToken, expiresAt, merchantId } = response.result;

    // Get locations to find the one matching the sandbox name
    const { default: pkg } = await import('square');
    const { SquareClient, SquareEnvironment } = pkg;
    const tempClient = new SquareClient({
      token: accessToken,
      environment: process.env.SQUARE_ENVIRONMENT === "production" 
        ? SquareEnvironment.Production 
        : SquareEnvironment.Sandbox
    });

    const locationsResponse = await tempClient.locationsApi.listLocations();
    const locations = locationsResponse.result.locations || [];
    
    // Try to find location that matches sandbox name (e.g. "YV_sandbox")
    // If not found, just use the first active location
    const matchedLocation = locations.find(loc => 
      loc.name.toLowerCase() === sandbox.toLowerCase()
    ) || locations[0];

    const hoa = await Hoa.findOneAndUpdate(
      { hoaid },
      {
        square_access_token: accessToken,
        square_refresh_token: refreshToken,
        square_token_expires_at: new Date(expiresAt),
        square_merchant_id: merchantId,
        square_sandbox_id: sandbox,
        square_location_id: matchedLocation?.id
      },
      { new: true }
    );

    if (!hoa) {
      return res.status(404).json({ message: "HOA not found" });
    }

    res.json({ message: "Square connected successfully", hoa });
  } catch (error) {
    console.error("Square OAuth Callback error:", error);
    res.status(500).json({ message: error.message });
  }
};

export { getHoaById, getHoas, updateHoaById, initiateSquareAuth, squareOAuthCallback };

/*


*/