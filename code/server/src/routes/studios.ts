import { Router, Response } from 'express';
import { StudioParamsSchema } from '../sharedTypes';
import StudioService from '../services/studios';
import SessionsService, { SessionRequest } from '../services/sessions';
import { PoseBadRequestError } from '../services/errors';

const router = Router();

router.get(
  '/studios',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    const userId = SessionsService.getUserId(request) as string;
    const studios = await StudioService.listStudios(userId);
    return response.status(200).json({ studios });
  }
);

router.get(
  '/studios/:id',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    const studio = await StudioService.getStudio(request.params.id);
    return response.status(200).json({ studio });
  }
);

// POST /studios - Create a new studio
router.post(
  '/studios',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    const userId = SessionsService.getUserId(request) as string;

    // Validate the request body
    const parseResult = StudioParamsSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new PoseBadRequestError(
        `Error creating studio: ${parseResult.error.format()}`
      );
    }
    const studio = await StudioService.createStudio(parseResult.data, userId);
    return response.status(201).json({ studio });
  }
);

// POST /studios/quickstart - Create 3 sample studios and return all studios
router.post(
  '/studios/quickstart',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    const userId = SessionsService.getUserId(request) as string;

    await StudioService.createSampleStudio(userId);
    await StudioService.createSampleStudio(userId);
    await StudioService.createSampleStudio(userId);

    // Return the list of all studios
    const studios = await StudioService.listStudios(userId);
    return response.status(200).json({ studios });
  }
);

export default router;
