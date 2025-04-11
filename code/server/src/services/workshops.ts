import crypto from 'crypto';
import { faker } from '@faker-js/faker';
import stripe from '../clients/stripe';
import { Workshop, WorkshopParams, sampleWorkshopName } from '../sharedTypes';
import { listInstructors } from './instructors';
import { listStudios } from './studios';
import { loadUserOrThrow } from './users';
import { dbService } from './db';

async function createWorkshop(data: WorkshopParams, userId: string) {
  const { stripeAccount } = await loadUserOrThrow(userId);
  const price = await stripe.getSdk().prices.create(
    {
      product_data: {
        name: `${data.instructorName} - ${data.name}`,
      },
      nickname: data.name,
      unit_amount: data.amount * 100,
      currency: 'usd',
    },
    {
      stripeAccount,
    }
  );
  if (!price) throw new Error('Failed to create price');

  const paymentLink = await stripe.getSdk().paymentLinks.create(
    {
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      application_fee_amount: Math.floor(data.amount * 0.1 * 100),
    },
    {
      stripeAccount,
    }
  );

  if (!paymentLink) throw new Error('Failed to create payment link');

  const id = `wkshp_${crypto.randomUUID()}`;

  const workshop: Workshop = {
    ...data,
    userId,
    id,
    attendees: 0,
    paymentLinkId: paymentLink.id,
    paymentLinkUrl: paymentLink.url,
  };

  await dbService.saveData('workshops', id, workshop);

  return workshop;
}

/**
 * Returns a random number between 50 and 100, in increments of 5, this will be the paymentlink amount in dollars.
 * See createWorkshop where this value is converted to cents.
 * @returns A random number between 50 and 100.
 */
function sampleAmount(): number {
  return faker.number.int({ min: 50, max: 100, multipleOf: 5 });
}

export async function createSampleWorkshops(
  userId: string,
  workshopsPerStudio: number = 7
) {
  // Load all instructors and studios
  const instructors = await listInstructors(userId);
  const studios = await listStudios(userId);

  if (instructors.length === 0) throw new Error('No instructors available');
  if (studios.length === 0) throw new Error('No studios available');

  const today = new Date();
  today.setHours(9, 0, 0, 0); // Start at 9am today

  const workshops: Workshop[] = [];
  for (const studio of studios) {
    let currentStartTime = new Date(today);

    for (let i = 0; i < workshopsPerStudio; i++) {
      // Pick a random instructor
      const instructor = faker.helpers.arrayElement(instructors);

      const workshopParams: WorkshopParams = {
        name: sampleWorkshopName(),
        start: currentStartTime.toISOString(),
        end: new Date(
          currentStartTime.getTime() + 60 * 60 * 1000
        ).toISOString(), // 1 hour later
        instructorName: instructor.name,
        resourceName: studio.name,
        resourceId: studio.id,
        capacity: studio.maxCapacity,
        amount: sampleAmount(),
      };

      const workshop = await createWorkshop(workshopParams, userId);
      workshops.push(workshop);

      // Calculate the next start time
      const nextStartOffset =
        faker.number.int({ min: 0, max: 180, multipleOf: 30 }) * 60 * 1000; // Random offset between 0 and 3 hours (in 30-minute increments)
      currentStartTime = new Date(
        currentStartTime.getTime() + 60 * 60 * 1000 + nextStartOffset
      ); // Add 1 hour for the current workshop duration + offset

      // If the next workshop starts after 5pm, move to the next day at 9am
      if (currentStartTime.getHours() >= 17) {
        currentStartTime.setDate(currentStartTime.getDate() + 1);
        currentStartTime.setHours(9, 0, 0, 0); // Reset to 9am the next day
      }
    }
  }

  return workshops;
}

async function getWorkshop(workshopId: string) {
  const workshop = dbService.loadData('workshops', workshopId);
  if (!workshop) throw new Error('Workshop not found');
  return workshop;
}

async function listWorkshops(userId: string) {
  const workshops = dbService.searchData(
    'workshops',
    (item) => item.userId === userId
  );
  if (!workshops) throw new Error('Workshops not found');

  return workshops;
}

async function updateWorkshop(workshopId: string, data: Workshop) {
  await dbService.saveData('workshops', workshopId, data);
}

async function deleteWorkshop(workshopId: string) {
  await dbService.deleteData('workshops', workshopId);
}

export const WorkshopService = {
  createWorkshop,
  createSampleWorkshops,
  getWorkshop,
  listWorkshops,
  updateWorkshop,
  deleteWorkshop,
};
