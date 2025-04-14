/**
 * Laying out the fundamental data types which are shared
 * between the client and server. Centralized in one file
 * to make it easier to keep consistent with client-side
 * copy, which is separate in order to support multiple
 * server and client implementations.
 */

import Stripe from 'stripe';
import z from 'zod';
import { faker } from '@faker-js/faker';

import { createTypeGuard } from './helpers';

// #region USER & ACCOUNT TYPES
export interface PoseAccount extends Stripe.Account {
  charges_enabled: boolean;
  requirements: Stripe.Account.Requirements;
  metadata: {
    userId: string;
  };
}

export function isPoseAccount(account: any): account is PoseAccount {
  return (
    account.object === 'account' &&
    typeof account.metadata?.userId === 'string' &&
    typeof account.charges_enabled === 'boolean' &&
    typeof account.requirements === 'object'
  );
}

export const UserParamsSchema = z.object({
  name: z.string(),
  email: z.string(),
});
export const isUserParams = createTypeGuard(UserParamsSchema);
export type UserParams = z.infer<typeof UserParamsSchema>;

export const UserSchema = UserParamsSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  stripeAccount: z.string(),
  chargesEnabled: z.boolean(),
  disabledReason: z.string().nullable(),
  detailsSubmitted: z.boolean(),
});
export const isUser = createTypeGuard(UserSchema);
export type User = z.infer<typeof UserSchema>;

// #endregion

// #region WORKSHOP TYPES

export const YOGA_TYPES = [
  'Hatha',
  'Vinyasa',
  'Ashtanga',
  'Bikram',
  'Yin',
  'Restorative',
  'Power',
  'Kundalini',
  'Aerial',
  'Anusara',
];

export function sampleWorkshopName() {
  return `${faker.helpers.arrayElement(YOGA_TYPES)} Yoga`;
}

export const WorkshopParamsSchema = z.object({
  name: z.string().min(1),
  instructorId: z.string().min(1),
  studioId: z.string().min(1),
  capacity: z.coerce.number().min(1),
  amount: z.coerce.number().min(0),
  start: z.string(),
  end: z.string(),
});
export const isWorkshopParams = createTypeGuard(WorkshopParamsSchema);
export type WorkshopParams = z.infer<typeof WorkshopParamsSchema>;

export const WorkshopSchema = WorkshopParamsSchema.extend({
  attendees: z.number().min(0),
  id: z.string(),
  userId: z.string(),
  paymentLinkId: z.string(),
  paymentLinkUrl: z.string(),
});
export const isWorkshop = createTypeGuard(WorkshopSchema);
export type Workshop = z.infer<typeof WorkshopSchema>;

// #endregion

// #region INSTRUCTOR TYPES

export const InstructorParamsSchema = z.object({
  name: z.string(),
  profilePhoto: z.string().url().optional().or(z.literal('')), // Allow empty strings for optional profilePhoto
});
export const isInstructorParams = createTypeGuard(InstructorParamsSchema);
export type InstructorParams = z.infer<typeof InstructorParamsSchema>;

export const InstructorSchema = InstructorParamsSchema.extend({
  id: z.string(),
  userId: z.string(),
});
export const isInstructor = createTypeGuard(InstructorSchema);
export type Instructor = z.infer<typeof InstructorSchema>;

// #endregion

// #region STUDIO TYPES

export const StudioParamsSchema = z.object({
  name: z.string(),
  maxCapacity: z.number(),
});
export const isStudioParams = createTypeGuard(StudioParamsSchema);
export type StudioParams = z.infer<typeof StudioParamsSchema>;

export const StudioSchema = StudioParamsSchema.extend({
  id: z.string(),
  userId: z.string(),
});
export const isStudio = createTypeGuard(StudioSchema);
export type Studio = z.infer<typeof StudioSchema>;

// #endregion

// #region checkout session types

export const CheckoutSessionSchema = z.object({
  id: z.string(),
  object: z.literal('checkout.session'),
  metadata: z.object({
    instructorId: z.string(),
    studioId: z.string(),
    instructorName: z.string(),
    studioName: z.string(),
    workshopId: z.string(),
  }),
});
export const isCheckoutSession = createTypeGuard(CheckoutSessionSchema);
export type CheckoutSession = z.infer<typeof CheckoutSessionSchema>;

// #endregion
