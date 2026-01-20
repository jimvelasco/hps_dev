// server/src/config/square.js
// server/src/config/square.js
import pkg from 'square';
const { SquareClient, SquareEnvironment } = pkg;

export const squareClient = new SquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.NODE_ENV === "production" ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});





