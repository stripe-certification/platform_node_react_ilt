import stripe from '../clients/stripe';
import Stripe from 'stripe';

async function createAccountSession(
  stripeAccountId: string
): Promise<Stripe.AccountSession> {
  let accountSession: Stripe.AccountSession;
  // Training TODO: Create an account session object.
  return accountSession;
}

export const AccountsService = {
  createAccountSession,
};
