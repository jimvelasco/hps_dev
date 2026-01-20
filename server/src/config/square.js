// server/src/config/square.js
import pkg from 'square';
import dotenv from 'dotenv';

dotenv.config();

const { SquareClient, SquareEnvironment } = pkg;

// Use SQUARE_ENVIRONMENT env var if set, otherwise default to Sandbox for safety
const environment = process.env.SQUARE_ENVIRONMENT === "production" 
  ? SquareEnvironment.Production 
  : SquareEnvironment.Sandbox;

if (!process.env.SQUARE_ACCESS_TOKEN) {
  console.error("❌ SQUARE_ACCESS_TOKEN is missing from environment variables!");
} else {
  console.log(`✅ Square Client initialized in ${process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox"} mode`);
}

export const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: environment,
});
