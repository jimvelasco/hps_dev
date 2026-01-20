import { Client, Environment } from "square";

const token = process.env.SQUARE_ACCESS_TOKEN;
const locationId = process.env.SQUARE_LOCATION_ID;
const environment = process.env.NODE_ENV === "production" ? Environment.Production : Environment.Sandbox;

if (!token || token === "xEAAAl8Y8P2W1v1mL6HlXM_6fn4pZaKFZVL8_O7REKvn_BKDXhdl_JuLeoT2BXaX8") {
  console.error("❌ SQUARE_ACCESS_TOKEN is not set or is a placeholder!");
  console.error("   Set SQUARE_ACCESS_TOKEN in /server/.env with your actual token");
}

if (!locationId) {
  console.error("❌ SQUARE_LOCATION_ID is not set!");
}

export const squareClient = new Client({
  accessToken: token,
  environment: environment
});




