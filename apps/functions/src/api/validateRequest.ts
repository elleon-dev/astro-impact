import { validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";

export const validateRequest = async (
  req: Request<
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>,
    Record<string, unknown>
  >,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).send(errors.array());
    return;
  }

  next();
};
