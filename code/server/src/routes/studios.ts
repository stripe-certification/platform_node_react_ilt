import { Router, Response } from 'express';

import { StudioParamsSchema } from '../sharedTypes';
import StudioService from '../services/studios';
import SessionsService, { SessionRequest } from '../services/sessions';

const router = Router();

router.get(
    '/studios',
    SessionsService.isAuthenticated,
    async (request: SessionRequest, response: Response) => {
        const userId = SessionsService.getUserId(request) as string;

        try {
            const studios = await StudioService.listStudios(userId);
            return response.status(200).json({ studios });
        } catch (error: any) {
            console.error('Error listing studios:', error);
            return response.status(500).json({ error });
        }
    }
);

router.get(
    '/studios/:id',
    SessionsService.isAuthenticated,
    async (request: SessionRequest, response: Response) => {
        try {
            const studio = await StudioService.getStudio(request.params.id);
            return response.status(200).json({ studio });
        } catch (error: any) {
            console.error('Error getting studio:', error);
            return response.status(500).json({ error });
        }
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
        if (!parseResult.success) return response.status(400).json({
            error: { message: parseResult.error.format() }
        });

        try {
            const studio = await StudioService.createStudio(parseResult.data, userId);
            return response.status(201).json({ studio });
        } catch (error: any) {
            console.error('Error creating studio:', error);
            return response.status(500).json({ error: 'Internal server error' });
        }
    }
);

// POST /studios/quickstart - Create 3 sample studios and return all studios
router.post(
    '/studios/quickstart',
    SessionsService.isAuthenticated,
    async (request: SessionRequest, response: Response) => {
        const userId = SessionsService.getUserId(request) as string;

        try {
            await StudioService.createSampleStudio(userId);
            await StudioService.createSampleStudio(userId);
            await StudioService.createSampleStudio(userId);

            // Return the list of all studios
            const studios = await StudioService.listStudios(userId);
            return response.status(200).json({ studios });
        } catch (error: any) {
            console.error('Error in quickstart:', error);
            return response.status(500).json({ error });
        }
    }
);

export default router;