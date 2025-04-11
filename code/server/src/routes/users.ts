import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { User } from '../sharedTypes';
import UserService, { RequestWithUserId } from '../services/users';
import SessionsService, { SessionRequest } from '../services/sessions';
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

    try {
      const user: User | null = await UserService.findUserByEmail(email);

      if (!user) {
        return response.status(404).json({ error: 'User not found' });
      }

      request.userId = user.id;
      next();
    } catch (error: any) {
      console.error('Error signing in user:', error);
      return response.status(500).json({ error: error.message });
    }
  },
  SessionsService.create,
  async (request: Request, response: Response) => {
    try {
      const userId = SessionsService.getUserId(request);

      const user = await UserService.loadUserOrThrow(userId as string);
      response.send(user);
    } catch (error: any) {
      console.error('Error fetching user:', error);
      return response.status(500).json({ error: error.message });
    }
  }
);

router.post('/users/logout', async (request: Request, response: Response) => {
  try {
    SessionsService.clear(request, response);
  } catch (error: any) {
    console.error('Error logging out user:', error);
    return response.status(500).json({ error: error.message });
  }
});

router.post(
  '/users',
  body('email').isEmail().normalizeEmail(),
  async (request: SessionRequest, response: Response, next: NextFunction) => {
    const {
      values: { email, name },
    }: { values: { email: string; name: string } } = request.body;

    try {
      if (!email || !name) {
        return response.status(400).json({ error: 'Missing name or email' });
      }

      const params = { email, name };
      const user = await UserService.createUser(params);
      if (!user) {
        return response.status(500).json({ error: 'User not created' });
      }

      request.userId = user.id;
      next();
    } catch (error: any) {
      console.error('Error creating user:', error);
      return response.status(500).json({ error: error.message });
    }
  },
  SessionsService.create,
  async (request: SessionRequest, response: Response) => {
    try {
      if (!request.session.user) {
        return response
          .status(500)
          .json({ error: { message: 'User missing from session' } });
      }

      const user = await UserService.loadUserOrThrow(request.userId as string);
      response.send(user);
    } catch (error: any) {
      console.error('Error fetching user:', error);
      return response.status(500).json({ error: error.message });
    }
  }
);

router.get('/users', async (request: Request, response: Response) => {
  const userId = SessionsService.getUserId(request);

  if (!userId) {
    return response.send(null);
  }

  const user = await UserService.loadUserOrThrow(userId as string);
  response.send(user);
});

export default router;
