import { Router, raw, Request, Response } from 'express';
import stripe from '../clients/stripe';
import UserService from '../services/users';
import { isCheckoutSession, isPoseAccount } from '../sharedTypes';

const router = Router();

/**
 * Handles Stripe webhook events.
 *
 * @param {request} request
 * @param {response} 200 JSON response including {received: true}
 */
router.post(
  '/webhook',
  raw({ type: 'application/json' }),
  async (request: Request, response: Response) => {
    try {
      let event = null;
      // Training TODO: Handle a webhook event
      // Start by constructing the event from the payload

      switch (event.type) {
        case 'account.updated':
          // Training TODO: Handle an `account.updated` event
          break;
        case 'checkout.session.completed':
          // Training TODO: Handle an `checkout.session.completed` event
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
