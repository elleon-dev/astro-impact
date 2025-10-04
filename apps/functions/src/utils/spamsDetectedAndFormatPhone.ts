import assert from "assert";
import { isEmpty } from "lodash";
import { fetchCollection } from "../firebase/firestore";
import { spamsRef } from "../collections";
import { logger } from "./logger";

export const spamsDetectedAndFormatPhone = async (
  contact: Contact,
): Promise<boolean> => {
  assert(contact.email, "Missing contact.email!");
  assert(contact.phone.number, "Missing phone.number!");

  const regexPhoneNumber = /^9\d{8}$/;

  if (!regexPhoneNumber.test(contact.phone.number.toString())) return true;

  const p0 = fetchCollection(
    spamsRef
      .where("type", "==", "email")
      .where("value", "==", contact.email)
      .where("isDeleted", "==", false),
  );

  const p1 = fetchCollection(
    spamsRef
      .where("type", "==", "phone")
      .where("value", "==", contact.phone.number.toString())
      .where("isDeleted", "==", false),
  );

  const [spamsWithEmails, spamsWithPhones] = await Promise.all([p0, p1]);

  logger.log("spamsWithEmails: ", spamsWithPhones);
  logger.log("spamsWithPhones: ", spamsWithPhones);

  return !isEmpty(spamsWithEmails) || !isEmpty(spamsWithPhones);
};
