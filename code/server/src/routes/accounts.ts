import { Router, Request, Response } from 'express';
import stripe from '../clients/stripe';
import { isPoseAccount } from '../sharedTypes';
import { PoseNotFoundError } from '../services/errors';

const router = Router();

router.get('/accounts', async (request: Request, response: Response) => {
  const account = await stripe.getSdk().accounts.retrieve(request.body);
  if (!isPoseAccount(account)) {
    throw new PoseNotFoundError('Invalid account');
  }

  return response.status(200).json(account);
});

export default router;
