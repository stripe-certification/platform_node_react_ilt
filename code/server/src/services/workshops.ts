import crypto from 'crypto';
import { faker } from '@faker-js/faker';
import stripe from '../clients/stripe';
import {
  Workshop,
  WorkshopCreateParams,
  sampleWorkshopName,
} from '../sharedTypes';
import { getInstructor, listInstructors } from './instructors';
import { getStudio, listStudios } from './studios';
import { loadUserOrThrow } from './users';
import { dbService } from './db';
import { PoseError, PoseNotFoundError } from './errors';

async function createWorkshop(data: WorkshopCreateParams, userId: string) {
  const { stripeAccount } = loadUserOrThrow(userId);
  const studio = await getStudio(data.studioId);

  let paymentLink;
  // Training TODO: Create a payment link that will be used in the workshop object.

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

  if (instructors.length === 0) throw new PoseError('No instructors available');
  if (studios.length === 0) throw new PoseError('No studios available');

  const today = new Date();
  const currentHour = today.getHours();
  const startingHour = currentHour < 9 || currentHour > 4 ? 9 : currentHour + 1; // Start at 9am or later today
  today.setHours(startingHour, 0, 0, 0);

  const workshops: Workshop[] = [];
  for (const studio of studios) {
    let currentStartTime = new Date(today);

    for (let i = 0; i < workshopsPerStudio; i++) {
      // Pick a random instructor
      const instructor = faker.helpers.arrayElement(instructors);

      const workshopParams: WorkshopCreateParams = {
        name: sampleWorkshopName(),
        start: currentStartTime,
        end: new Date(currentStartTime.getTime() + 60 * 60 * 1000), // 1 hour later
        instructorId: instructor.id,
        studioId: studio.id,
        capacity: studio.maxCapacity,
        amount: sampleAmount(),
      };
      try {
        const workshop = await createWorkshop(workshopParams, userId);
        workshops.push(workshop);
      } catch (error) {
        console.error(
          `Failed to create workshop for studio ${studio.name} and instructor ${instructor.name}:`,
          error
        );
        throw error;
      }

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

function getWorkshop(workshopId: string) {
  const workshop = dbService.loadData('workshops', workshopId.trim());
  if (!workshop)
    throw new PoseNotFoundError(`Workshop ${workshopId} not found`);
  return workshop;
}

async function listWorkshops(userId: string) {
  const workshops = dbService.searchData(
    'workshops',
    (item) =>
      item.userId === userId && new Date(item.end) >= new Date(Date.now())
  );
  if (!workshops) throw new PoseNotFoundError('Workshops not found');

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
