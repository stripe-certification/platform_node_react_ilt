import { Router, Request, Response } from 'express';
import SessionsService from '../services/sessions';
import { AccountsService } from '../services/accounts';
import UserService from '../services/users';
const router = Router();

router.post(
  '/account-sessions',
  async (request: Request, response: Response) => {
    const userId = SessionsService.getUserId(request);
    if (!userId) throw new Error('User not found');
    const user = await UserService.loadUserOrThrow(userId);
    const stripeAccountId = user.stripeAccount;

    if (!stripeAccountId) throw new Error('Stripe account ID not found');

    try {
      const accountSession =
        await AccountsService.createAccountSession(stripeAccountId);
      return response
        .status(200)
        .json({ client_secret: accountSession.client_secret });
    } catch (error: any) {
      console.error('Error creating account session:', error);
      return response.status(500).json({ error });
    }
  }
);

export default router;
