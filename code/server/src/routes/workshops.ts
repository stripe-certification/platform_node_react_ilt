import { Router, Response } from 'express';
import { WorkshopService } from '../services/workshops';
import SessionsService, { SessionRequest } from '../services/sessions';
import { WorkshopParamsSchema } from '../sharedTypes';
const router = Router();

router.post(
  '/workshops',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    const userId = SessionsService.getUserId(request) as string;
    const workshopParams = WorkshopParamsSchema.safeParse(request.body);
    if (!workshopParams.success) {
      return response.status(400).json({
        error: { message: workshopParams.error.format() },
      });
    }
    try {
      const workshop = await WorkshopService.createWorkshop(
        request.body,
        userId
      );
      return response.status(200).json({ workshop });
    } catch (error: any) {
      console.error('Error creating workshop:', error);
      return response.status(500).json({ error });
    }
  }
);

router.get(
  '/workshops',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    const userId = SessionsService.getUserId(request) as string;

    try {
      const workshops = await WorkshopService.listWorkshops(userId);
      return response.status(200).json({ workshops });
    } catch (error: any) {
      console.error('Error listing workshops:', error);
      return response.status(500).json({ error });
    }
  }
);

router.get(
  '/workshops/:workshopId',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    try {
      const workshop = await WorkshopService.getWorkshop(
        request.params.workshopId
      );
      return response.status(200).json({ workshop });
    } catch (error: any) {
      console.error('Error getting workshop:', error);
      return response.status(500).json({ error });
    }
  }
);

router.put(
  '/workshops/:workshopId',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    try {
      const workshop = await WorkshopService.updateWorkshop(
        request.params.workshopId,
        request.body
      );
      return response.status(200).json({ workshop });
    } catch (error: any) {
      console.error('Error updating workshop:', error);
      return response.status(500).json({ error });
    }
  }
);

router.delete(
  '/workshops/:workshopId',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    try {
      await WorkshopService.deleteWorkshop(request.params.workshopId);
      return response.status(200).json({ message: 'Workshop deleted' });
    } catch (error: any) {
      console.error('Error deleting workshop:', error);
      return response.status(500).json({ error });
    }
  }
);

router.post(
  '/workshops/quickstart',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    const userId = SessionsService.getUserId(request) as string;

    try {
      const workshops = await WorkshopService.createSampleWorkshops(userId);
      return response.status(200).json({ workshops });
    } catch (error: any) {
      console.error('Error seeding workshops:', error);
      return response.status(500).json({ error });
    }
  }
);
export default router;
