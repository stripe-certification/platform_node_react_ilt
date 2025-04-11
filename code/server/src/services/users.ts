import crypto from 'crypto';
import Stripe from 'stripe';
import { Request } from 'express';
import { dbService } from './db';
import stripe from '../clients/stripe';
import { User, PoseAccount, UserParams } from '../sharedTypes';

export interface RequestWithUserId extends Request {
  userId?: string;
}

export function loadUserOrThrow(id: string): User {
  const user = dbService.loadData('users', id);
  if (!user) throw new Error(`User ${id} not found`);
  return user;
}

export function userExists(id: string): boolean {
  const user = dbService.loadData('users', id);
  return !!user;
}

export async function createUser(userData: UserParams): Promise<User> {
  const { email, name } = userData;

  const existing = findUserByEmail(email);
  if (existing) {
    throw new Error(`User with email ${email} already exists`);
  }
  const id = `usr_${crypto.randomUUID()}`;

  const now = new Date();

  const payload: Stripe.AccountCreateParams = {
    email: email,
    country: 'US',
    capabilities: {
      transfers: {
        requested: true,
      },
      card_payments: {
        requested: true,
      },
    },
    controller: {
      fees: {
        payer: 'application',
      },
      requirement_collection: 'application',
      stripe_dashboard: {
        type: 'none',
      },
      losses: {
        payments: 'application',
      },
    },
    metadata: {
      userId: id,
    },
  };

  const stripeAccount = await stripe.getSdk().accounts.create(payload);
  if (!stripeAccount.id) throw new Error('Error creating stripe account');
  const newUser: User = {
    name: name,
    email: email,
    updatedAt: now,
    id,
    createdAt: now,
    stripeAccount: stripeAccount.id,
    chargesEnabled: false,
    disabledReason: null,
    detailsSubmitted: false,
  };

  await dbService.saveData('users', id, newUser);
  return newUser;
}

export async function updateUser(
  id: string,
  userUpdates: Partial<User>
): Promise<User> {
  const user = await loadUserOrThrow(id);

  const updateData: User = {
    ...user,
    ...userUpdates,
  };

  await dbService.saveData('users', id, updateData);
  return updateData;
}

export function findUserByEmail(email: string): User | null {
  const results = dbService.searchData('users', (user) => user.email === email);

  if (results.length > 1)
    throw Error(
      'Multiple users found with this email, please adjust your database'
    );
  if (results.length === 1) return results[0];
  return null;
}

export async function handleAccountUpdate(obj: PoseAccount) {
  const userId = obj.metadata.userId;
  await updateUser(userId, {
    chargesEnabled: obj.charges_enabled,
    disabledReason: obj.requirements.disabled_reason,
    detailsSubmitted: obj.details_submitted,
  });
}

export default {
  handleAccountUpdate,
  loadUserOrThrow,
  createUser,
  updateUser,
  findUserByEmail,
  userExists,
};
