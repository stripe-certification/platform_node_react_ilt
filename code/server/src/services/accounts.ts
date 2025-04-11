import stripe from '../clients/stripe';
import Stripe from 'stripe';

async function createAccountSession(
  stripeAccountId: string
): Promise<Stripe.AccountSession> {
  const components = {
    payments: {
      enabled: true,
    },
    payouts: {
      enabled: true,
      features: {
        disable_stripe_user_authentication: true,
        external_account_collection: true,
        edit_payout_schedule: true,
        standard_payouts: true,
        instant_payouts: true,
      },
    },
    account_management: {
      enabled: true,
      features: {
        disable_stripe_user_authentication: true,
        external_account_collection: true,
      },
    },
    account_onboarding: {
      enabled: true,
      features: {
        disable_stripe_user_authentication: true,
        external_account_collection: true,
      },
    },
    notification_banner: {
      enabled: true,
      features: {
        disable_stripe_user_authentication: true,
        external_account_collection: true,
      },
    },
    tax_settings: {
      enabled: true,
    },
    tax_registrations: {
      enabled: true,
    },
  };

  const accountSession = await stripe.getSdk().accountSessions.create({
    account: stripeAccountId,
    components: components,
  });
  return accountSession;
}

export const AccountsService = {
  createAccountSession,
};
