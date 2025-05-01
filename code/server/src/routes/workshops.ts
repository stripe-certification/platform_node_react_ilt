import { Router, Response } from 'express';
import { WorkshopService } from '../services/workshops';
import SessionsService, { SessionRequest } from '../services/sessions';
import {
  WorkshopFormSchema,
  WorkshopForm,
  WorkshopCreateParams,
} from '../sharedTypes';
import { getStudio } from '../services/studios';
import { checkForConflicts, computeStartEnd } from '../helpers';
import { PoseBadRequestError } from '../services/errors';

const router = Router();

router.post(
  '/workshops',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    const userId = SessionsService.getUserId(request) as string;
    const parsedResult = WorkshopFormSchema.safeParse(request.body);
    if (!parsedResult.success) {
      throw new PoseBadRequestError(
        `Error creating workshop: ${parsedResult.error.format()}`
      );
    }
    const workshopFormParams: WorkshopForm = parsedResult.data;
    const existingWorkshops = await WorkshopService.listWorkshops(userId);
    const conflict = checkForConflicts(existingWorkshops, workshopFormParams);
    if (conflict) {
      throw new PoseBadRequestError(`Error creating workshop: ${conflict}`);
    }
    //Build a WorkshopParams object from the WorkshopFormParms
    const { date, startTime, duration, studioId, ...rest } = workshopFormParams;
    const { start, end } = computeStartEnd({ date, startTime, duration });
    const studio = await getStudio(studioId);
    const capacity = studio.maxCapacity;
    const transformedValues: WorkshopCreateParams = {
      ...rest,
      start,
      end,
      studioId,
      capacity,
    };

    const workshop = await WorkshopService.createWorkshop(
      transformedValues,
      userId
    );
    return response.status(201).json({ workshop });
  }
);

router.get(
  '/workshops',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    const userId = SessionsService.getUserId(request) as string;
    const workshops = await WorkshopService.listWorkshops(userId);
    return response.status(200).json({ workshops });
  }
);

router.get(
  '/workshops/:workshopId',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    const workshop = WorkshopService.getWorkshop(request.params.workshopId);
    return response.status(200).json({ workshop });
  }
);

router.put(
  '/workshops/:workshopId',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    const workshop = await WorkshopService.updateWorkshop(
      request.params.workshopId,
      request.body
    );
    return response.status(200).json({ workshop });
  }
);

router.delete(
  '/workshops/:workshopId',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    await WorkshopService.deleteWorkshop(request.params.workshopId);
    return response.status(200).json({ message: 'Workshop deleted' });
  }
);

router.post(
  '/workshops/quickstart',
  SessionsService.isAuthenticated,
  async (request: SessionRequest, response: Response) => {
    const userId = SessionsService.getUserId(request) as string;
    const workshops = await WorkshopService.createSampleWorkshops(userId);
    return response.status(200).json({ workshops });
  }
);
export default router;
