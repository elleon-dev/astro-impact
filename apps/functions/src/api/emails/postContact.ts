import { NextFunction, Request, Response } from "express";
import { firestore } from "../../firebase";
import { assign, isEmpty, merge } from "lodash";
import { searchDataEmail } from "../_utils";
import moment from "moment/moment";
import { fetchCollection, now } from "../../firebase/firestore";
import { sendMailContactToReceptor } from "../../mailer";
import { spamsDetectedAndFormatPhone } from "../../utils";

interface Body {
  contact: EmailContact;
}

export const postContact = async (
  req: Request<unknown, unknown, Body, unknown>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { body: formData } = req;

    console.log("「Contact email Initialize」", {
      body: req.body,
    });

    if (!formData || isEmpty(formData)) {
      res.status(412).send("form_data_no_found").end();
      return;
    }

    const { contact } = formData;

    const client: Client | undefined = await fetchClient(contact.hostname);

    const existsSpams = await spamsDetectedAndFormatPhone(contact);

    if (existsSpams) {
      res.status(412).send("an_error_occurred").end();
      return;
    }

    if (!client || isEmpty(client)) {
      res.status(412).send("client_no_exists").end();
      return;
    }

    const p0 = fetchSetContact(contact, client);

    const p1 = sendMailContactToReceptor({
      contact: contact,
    });

    await Promise.all([p0, p1]);

    res.sendStatus(200).end();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const fetchClient = async (hostname: string): Promise<Client | undefined> => {
  const clients = await fetchCollection<Client>(
    firestore.collection("clients").where("hostname", "==", hostname),
  );

  return clients[0];
};

const fetchSetContact = async (
  contact: EmailContact,
  client: Client,
): Promise<void> => {
  const contactId = firestore.collection("contacts").doc().id;

  await firestore
    .collection("contacts")
    .doc(contactId)
    .set(mapContact(contactId, contact, client));
};

const mapContact = (
  contactId: string,
  contact: EmailContact,
  client: Client,
): OmitDefaultFirestoreProps<EmailContact> => {
  const contact_ = merge(contact, {
    id: contactId,
    clientId: client.id,
    hostname: client.hostname,
    fullName: (contact?.fullName || "").toLowerCase(),
    firstName: (contact?.firstName || "").toLowerCase(),
    lastName: (contact?.lastName || "").toLowerCase(),
    ...(contact?.userType && { userType: contact?.userType }),
    email: contact.email.toLowerCase(),
    ...(contact?.issue && { issue: contact?.issue }),
    ...(contact?.message && { message: contact.message }),
    phone: contact.phone,
    ...(contact?.service && { service: contact.service }),
    ...(contact?.contactPreference && {
      contactPreference: contact.contactPreference,
    }),
    termsAndConditions: contact?.termsAndConditions || true,
    createAtString: moment(now().toDate()).format("YYYY-MM-DD"),
    isDeleted: false,
    status: "pending",
    type: "contact",
    createAt: now(),
  });

  return assign({}, contact_, {
    searchData: searchDataEmail(contact_),
  });
};
