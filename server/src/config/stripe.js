import Stripe from 'stripe'
import { AppError } from '../utils/AppError.js'

let client

// Created on first use so the server still starts without Stripe keys.
export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new AppError(503, 'Payments are not set up yet (STRIPE_SECRET_KEY missing in .env)')
  client ??= new Stripe(key)
  return client
}

export const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY)
