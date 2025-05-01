import crypto from 'crypto';
import Stripe from 'stripe';
import { Request } from 'express';
import { dbService } from './db';
import stripe from '../clients/stripe';
import {
  User,
  PoseAccount,
  UserParams,
  isWorkshop,
  CheckoutSession,
} from '../sharedTypes';
import { WorkshopService } from './workshops';
import { PoseError, PoseBadRequestError } from './errors';

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
    throw new PoseBadRequestError(`User with email ${email} already exists`);
  }
  const id = `usr_${crypto.randomUUID()}`;

  const now = new Date();

  let payload: Stripe.AccountCreateParams;
  let stripeAccount: Stripe.Account;

  // Training TODO: When a user signup for the Pose app, create a new Stripe account
  // for them. Populate the payload to pass to the account create method.
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
    throw new PoseError(
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

export async function incrementEventAttendees(obj: CheckoutSession) {
  console.log(
    'Incrementing event attendees for workshop',
    obj.metadata.workshopId
  );
  const workshop = WorkshopService.getWorkshop(obj.metadata.workshopId);
  if (!isWorkshop(workshop)) {
    console.error('Workshop not found', obj.metadata.workshopId);
    throw new PoseError(`Workshop ${obj.metadata.workshopId} not found`);
  }

  if (workshop.attendees < workshop.capacity) {
    await WorkshopService.updateWorkshop(workshop.id, {
      ...workshop,
      attendees: workshop.attendees + 1,
    });
  }
}

export default {
  handleAccountUpdate,
  loadUserOrThrow,
  createUser,
  updateUser,
  findUserByEmail,
  userExists,
  incrementEventAttendees,
};
