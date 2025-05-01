import { Router, Response } from 'express';
import {
  listInstructors,
  getInstructor,
  createInstructor,
  createSampleInstructor,
} from '../services/instructors';
import SessionsService, { SessionRequest } from '../services/sessions';
import { InstructorParamsSchema } from '../sharedTypes';
import { PoseBadRequestError } from '../services/errors';

const router = Router();

router.get(
  '/instructors',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    const userId = SessionsService.getUserId(request) as string;
    const instructors = await listInstructors(userId);
    return response.status(200).json({ instructors });
  }
);

router.get(
  '/instructors/:id',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    const instructor = await getInstructor(request.params.id);
    return response.status(200).json({ instructor });
  }
);

router.post(
  '/instructors',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    const userId = SessionsService.getUserId(request) as string;

    const parseResult = InstructorParamsSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new PoseBadRequestError(
        `Error creating instructor: ${parseResult.error.format()}`
      );
    }

    const instructor = await createInstructor(parseResult.data, userId);
    return response.status(201).json({ instructor });
  }
);

router.post(
  '/instructors/quickstart',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    const userId = SessionsService.getUserId(request) as string;

    // Create 5 sample instructors
    for (let i = 0; i < 5; i++) {
      await createSampleInstructor(userId);
    }

    // Return the list of all instructors
    const instructors = await listInstructors(userId);
    return response.status(200).json({ instructors });
  }
);

export default router;
