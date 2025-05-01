import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { User } from '../sharedTypes';
import UserService, { RequestWithUserId } from '../services/users';
import SessionsService, { SessionRequest } from '../services/sessions';
import {
  PoseError,
  PoseBadRequestError,
  PoseUnauthorizedError,
} from '../services/errors';
const router = Router();

router.post(
  '/users/login',
  body('email').isEmail().normalizeEmail(),
  async (
    request: RequestWithUserId,
    response: Response,
    next: NextFunction
  ) => {
    const email = request.body.email;

    const user: User | null = UserService.findUserByEmail(email);

    if (!user) {
      throw new PoseUnauthorizedError(`Error logging in, user not found`);
    }
    request.userId = user.id;
    next();
  },
  SessionsService.create,
  async (request: Request, response: Response) => {
    const userId = SessionsService.getUserId(request);
    const user = UserService.loadUserOrThrow(userId as string);
    response.send(user);
  }
);

router.post('/users/logout', async (request: Request, response: Response) => {
  SessionsService.clear(request, response);
});

router.post(
  '/users',
  body('email').isEmail().normalizeEmail(),
  async (request: SessionRequest, response: Response, next: NextFunction) => {
    const {
      values: { email, name },
    }: { values: { email: string; name: string } } = request.body;

    if (!email) {
      throw new PoseBadRequestError(`Error creating user, missing email`);
    }
    if (!name) {
      throw new PoseBadRequestError(`Error creating user, missing name`);
    }

    const params = { email, name };
    const user = await UserService.createUser(params);
    if (!user) {
      throw new PoseError(`Error creating user, user not created ${params}`);
    }
    request.userId = user.id;
    next();
  },
  SessionsService.create,
  async (request: SessionRequest, response: Response) => {
    if (!request.session.user) {
      throw new PoseUnauthorizedError('User missing from session');
    }

    const user = UserService.loadUserOrThrow(request.userId as string);
    response.send(user);
  }
);

router.get('/users', async (request: Request, response: Response) => {
  const userId = SessionsService.getUserId(request);

  const user = UserService.loadUserOrThrow(userId as string);
  response.send(user);
});

export default router;
