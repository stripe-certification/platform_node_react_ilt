import crypto from 'crypto';
import { dbService } from './db';
import { faker } from '@faker-js/faker';
import { Studio, StudioParams } from '../sharedTypes';
import { titleCase } from '../helpers';
import { PoseNotFoundError } from './errors';

export async function createStudio(data: StudioParams, userId: string) {
  const id = `stdio_${crypto.randomUUID()}`;

  const studio: Studio = {
    ...data,
    id,
    userId,
  };

  await dbService.saveData('studios', id, studio);

  return studio;
}

function sampleStudioName() {
  return titleCase(`${faker.color.human()} ${faker.animal.type()}`);
}

export async function createSampleStudio(userId: string) {
  const sampleStudioParams: StudioParams = {
    name: sampleStudioName(),
    maxCapacity: faker.number.int({ min: 10, max: 30, multipleOf: 5 }),
  };

  return createStudio(sampleStudioParams, userId);
}

export async function getStudio(studioId: string) {
  const studio = dbService.loadData('studios', studioId);
  if (!studio) throw new PoseNotFoundError(`Studio not found: ${studioId}`);
  return studio;
}

export async function listStudios(userId: string) {
  const studios = dbService.searchData(
    'studios',
    (item) => item.userId === userId
  );
  if (!studios) throw new PoseNotFoundError('Studios not found');

  return studios;
}

export async function deleteStudio(studioId: string) {
  const studio = dbService.loadData('studios', studioId);
  if (!studio)
    throw new PoseNotFoundError(`Studio not found for ID: ${studioId}`);

  await dbService.deleteData('studios', studioId);

  return {
    success: true,
    message: `Studio with ID ${studioId} deleted successfully.`,
  };
}

export default {
  createStudio,
  createSampleStudio,
  getStudio,
  listStudios,
  deleteStudio,
};
