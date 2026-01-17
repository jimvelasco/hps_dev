import { Client } from "square/legacy";

const token = process.env.SQUARE_ACCESS_TOKEN;
const locationId = process.env.SQUARE_LOCATION_ID;
console.log('token from env',token)

if (!token || token === "xEAAAl8Y8P2W1v1mL6HlXM_6fn4pZaKFZVL8_O7REKvn_BKDXhdl_JuLeoT2BXaX8") {
  console.error("❌ SQUARE_ACCESS_TOKEN is not set or is a placeholder!");
  console.error("   Set SQUARE_ACCESS_TOKEN in /server/.env with your actual token");
}

if (!locationId) {
  console.error("❌ SQUARE_LOCATION_ID is not set!");
}

// console.log("Square config:");
// console.log("  Access Token:", token ? `${token}` : "NOT SET");
// console.log("  Location ID:", locationId || "NOT SET");

export const squareClient = new Client({
  accessToken: token,
  environment: "sandbox"
});




