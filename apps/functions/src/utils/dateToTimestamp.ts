import { firestoreTimestamp } from "../firebase";
import moment from "moment";

export const dateToTimestamp = (dateString: Date): Timestamp => {
  const momentDate = moment.utc(dateString).tz("America/Lima");

  return firestoreTimestamp.fromDate(momentDate.toDate());
};
