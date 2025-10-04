import { validationResult } from "express-validator";
import { Handler } from "express";

export const validateRequest: Handler = (req, res, next) => {
  const errors = validationResult(req);

  errors.isEmpty() ? next() : res.status(400).send(errors.array()).end();
};
