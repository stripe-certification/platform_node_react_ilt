import { Router, Request, Response } from 'express';
import stripe from '../clients/stripe';
import { isPoseAccount } from '../sharedTypes';

const router = Router();

router.get('/accounts', async (request: Request, response: Response) => {
  try {
    const account = await stripe.getSdk().accounts.retrieve(request.body);
    if (!isPoseAccount(account)) throw new Error('Invalid account');

    return response.status(200).json(account);
  } catch (error: any) {
    console.error('Error retrieving account:', error);
    return response.status(500).json({ error });
  }
});

export default router;
