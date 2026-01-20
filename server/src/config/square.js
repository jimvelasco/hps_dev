// server/src/config/square.js
import pkg from 'square';
import dotenv from 'dotenv';

dotenv.config();

const { SquareClient, SquareEnvironment } = pkg;

const environment = process.env.NODE_ENV === "production" ? SquareEnvironment.Production : SquareEnvironment.Sandbox;

if (!process.env.SQUARE_ACCESS_TOKEN) {
  console.error("❌ SQUARE_ACCESS_TOKEN is missing from environment variables!");
} else {
  console.log(`✅ Square Client initialized in ${process.env.NODE_ENV === "production" ? "production" : "sandbox"} mode`);
}

export const squareClient = new SquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: environment,
});





