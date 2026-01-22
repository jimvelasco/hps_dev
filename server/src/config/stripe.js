// server/src/config/stripe.js
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY is missing from environment variables!");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
