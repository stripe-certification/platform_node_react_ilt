import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import Stripe from 'stripe';

console.log('Stripe SDK loaded, API version:', process.env.STRIPE_API_VERSION);
const apiVersion = (process.env.STRIPE_API_VERSION ||
  '2025-02-24.acacia;embedded_connect_beta=v2') as Stripe.LatestApiVersion;

class stripe {
  private static instance: Stripe | null = null;

  private constructor() {}

  static getSdk(): Stripe {
    if (!this.instance) {
      this.instance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion,
      });
    }
    return this.instance;
  }
}

export default stripe;
