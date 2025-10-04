import { NextFunction, Request, Response } from "express";
import { isEmpty } from "lodash";
import { firestore } from "../../firebase";
import { fetchDocument } from "../../firebase/firestore";
import { sendEmailMessageToEmisor } from "../../mailer";

interface Body {
  email: string;
  message: string;
  clientId: string;
}

export const postSendMessage = async (
  req: Request<unknown, unknown, Body, unknown>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { body: formData } = req;

    console.log("「Add sendMessage」Initialize", {
      params: req.params,
      body: req.body,
    });

    const client: Client | undefined = await fetchClient(formData.clientId);

    if (!client || isEmpty(client)) {
      res.status(412).send("client_no_exists").end();
      return;
    }

    await sendEmailMessageToEmisor({
      emailMessage: formData,
    });

    res.sendStatus(200).end();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const fetchClient = async (clientId: string): Promise<Client | undefined> => {
  return await fetchDocument<Client>(
    firestore.collection("clients").doc(clientId),
  );
};
