import { Router, Request, Response } from 'express';
import SessionsService from '../services/sessions';
import { AccountsService } from '../services/accounts';
import UserService from '../services/users';
import { PoseNotFoundError } from '../services/errors';
const router = Router();

router.post(
  '/account-sessions',
  async (request: Request, response: Response) => {
    const userId = SessionsService.getUserId(request);
    const user = UserService.loadUserOrThrow(userId);
    const stripeAccountId = user.stripeAccount;

    if (!stripeAccountId) {
      throw new PoseNotFoundError(`Stripe account ID not found`);
    }

    const accountSession =
      await AccountsService.createAccountSession(stripeAccountId);
    return response
      .status(200)
      .json({ client_secret: accountSession.client_secret });
  }
);

export default router;
