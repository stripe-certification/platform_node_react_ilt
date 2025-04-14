import { Router, raw, Request, Response } from 'express';
import stripe from '../clients/stripe';
import UserService from '../services/users';
import { isCheckoutSession, isPoseAccount } from '../sharedTypes';

const router = Router();

/**
 * Eventually handles Stripe webhook events.
 *
 * @param {request} request
 * @param {response} 200 JSON response including {received: true}
 */
router.post(
  '/webhook',
  raw({ type: 'application/json' }),
  async (request: Request, response: Response) => {
    try {
      const signature = request.headers['stripe-signature'];
      if (!signature) {
        throw new Error('Stripe signature missing');
      }

      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!endpointSecret) {
        throw new Error('Stripe webhook secret missing');
      }
      const event = await stripe
        .getSdk()
        .webhooks.constructEvent(request.body, signature, endpointSecret);
      const obj = event.data.object;

      switch (event.type) {
        case 'account.updated':
          if (isPoseAccount(obj)) {
            await UserService.handleAccountUpdate(obj);
          }
          break;
        case 'checkout.session.completed':
          if (isCheckoutSession(obj)) {
            await UserService.incrementEventAttendees(obj);
          }
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      response.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);

      response.status(200).json({ received: true });
    }
  }
);

export default router;
