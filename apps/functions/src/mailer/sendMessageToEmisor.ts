import { sendMail } from "./sendMail";
import { createSubject } from "./themes/common/subjects";
import { Templates } from "./themes/common";
import { createBody } from "./themes";
import { mapTemplateMessageMailMustache } from "./utils";
import assert from "assert";
import { fetchClient } from "../collections";

interface Props {
  emailMessage: EmailMessage;
}

export const sendEmailMessageToEmisor = async ({
  emailMessage,
}: Props): Promise<void> => {
  const client = await fetchClient(emailMessage.clientId);
  assert(client, "Missing client!");

  const view = mapTemplateMessageMailMustache(client, emailMessage);

  await sendMail(client, {
    to: emailMessage.email,
    subject: createSubject(Templates.EMAIL_MESSAGE, view),
    html: createBody(Templates.EMAIL_MESSAGE, "common", view),
  });
};
