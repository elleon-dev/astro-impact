import { sendMail } from "./sendMail";
import assert from "assert";
import { mapTemplateContactMailMustache } from "./utils";
import { createSubject } from "./themes/common/subjects";
import { createBody } from "./themes";
import { Templates } from "./themes/common";
import { fetchCollection } from "../firebase/firestore";
import { firestore } from "../firebase";

interface Props {
  contact: EmailContact;
}

export const sendMailContactToReceptor = async ({
  contact,
}: Props): Promise<void> => {
  assert(contact, "Missing contact");

  const client: Client | undefined = await fetchClientByHostname(
    contact.hostname,
  );
  assert(client, "Missing client by hostname:" + contact.hostname);

  const view = mapTemplateContactMailMustache(contact, client);

  await sendMail(client, {
    to: client.receptorEmail,
    bcc: client.receptorEmailsCopy,
    subject: createSubject(Templates.EMAIL_CONTACT, view),
    html: createBody(Templates.EMAIL_CONTACT, "common", view),
  });
};

const fetchClientByHostname = async (
  hostname: string,
): Promise<Client | undefined> => {
  const clients = await fetchCollection<Client>(
    firestore.collection("clients").where("hostname", "==", hostname),
  );

  return clients[0];
};
