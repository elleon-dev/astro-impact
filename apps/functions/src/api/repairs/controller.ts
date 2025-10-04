import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import { createRepair } from "./createRepair";

export const postRepair = async (
  req: Request<unknown, unknown, Repair, unknown>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { body: repair } = req;

  logger.log("「Add repair」Initialize", {
    body: req.body,
  });

  try {
    await createRepair(repair);

    res.sendStatus(200).end();
  } catch (error) {
    console.error(error);
    next(error);
  }
};
