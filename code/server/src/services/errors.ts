import { NextFunction, Request, Response } from 'express';
import { Stripe } from 'stripe';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`handling error ${err.message}`);
  let code = 500;
  let message;
  if (err instanceof Stripe.errors.StripeError) {
    code = Number(err.statusCode ? err.statusCode : '500');
    message = `${err.type}: ${err.message}`;
  } else if (err instanceof PoseError) {
    code = err.code;
    message = err.message;
  } else {
    message = err.message ? err.message : 'Unknown error';
    code = res.statusCode ? res.statusCode : 500;
    console.error(`Error: ${code}: ${message}`);
  }
  res.status(code).send({ error: { message } });
};

export class PoseError extends Error {
  code: number;
  constructor(message: string, code?: number) {
    super(message);
    this.name = 'PoseError';
    this.code = code || 500;
    Object.setPrototypeOf(this, PoseError.prototype);
  }
}

export class PoseNotFoundError extends PoseError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'PoseNotFoundError';
    Object.setPrototypeOf(this, PoseNotFoundError.prototype);
  }
}

export class PoseBadRequestError extends PoseError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'PoseBadRequestError';
    Object.setPrototypeOf(this, PoseBadRequestError.prototype);
  }
}

export class PoseUnauthorizedError extends PoseError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'PoseUnauthorizedError';
    Object.setPrototypeOf(this, PoseUnauthorizedError.prototype);
  }
}
