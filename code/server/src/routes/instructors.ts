import { Router, Response } from 'express';
import {
    listInstructors,
    getInstructor,
    createInstructor,
    createSampleInstructor,
} from '../services/instructors';
import SessionsService, { SessionRequest } from '../services/sessions';
import { InstructorParamsSchema } from '../sharedTypes';

const router = Router();

router.get(
    '/instructors',
    SessionsService.isAuthenticated,
    async (request: SessionRequest, response: Response) => {
        const userId = SessionsService.getUserId(request) as string;

        try {
            const instructors = await listInstructors(userId);
            return response.status(200).json({ instructors });
        } catch (error: any) {
            console.error('Error listing instructors:', error);
            return response.status(500).json({ error });
        }
    }
);

router.get(
    '/instructors/:id',
    SessionsService.isAuthenticated,
    async (request: SessionRequest, response: Response) => {
        try {
            const instructor = await getInstructor(request.params.id);
            return response.status(200).json({ instructor });
        } catch (error: any) {
            console.error('Error getting instructor:', error);
            return response.status(500).json({ error });
        }
    }
);

router.post(
    '/instructors',
    SessionsService.isAuthenticated,
    async (request: SessionRequest, response: Response) => {
        const userId = SessionsService.getUserId(request) as string;

        const parseResult = InstructorParamsSchema.safeParse(request.body);
        if (!parseResult.success) {
            return response.status(400).json({
                error: 'Invalid request body',
                details: parseResult.error.errors,
            });
        }

        try {
            const instructor = await createInstructor(parseResult.data, userId);
            return response.status(201).json({ instructor });
        } catch (error: any) {
            console.error('Error creating instructor:', error);
            return response.status(500).json({ error: 'Internal server error' });
        }
    }
);

router.post(
    '/instructors/quickstart',
    SessionsService.isAuthenticated,
    async (request: SessionRequest, response: Response) => {
        const userId = SessionsService.getUserId(request) as string;

        try {
            // Create 5 sample instructors
            for (let i = 0; i < 5; i++) {
                await createSampleInstructor(userId);
            }

            // Return the list of all instructors
            const instructors = await listInstructors(userId);
            return response.status(200).json({ instructors });
        } catch (error: any) {
            console.error('Error in quickstart:', error);
            return response.status(500).json({ error });
        }
    }
);

export default router;