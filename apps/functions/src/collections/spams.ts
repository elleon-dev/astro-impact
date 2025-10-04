import { firestore } from "../firebase";
import { fetchCollection, fetchDocument } from "../firebase/firestore";

export const spamsRef = firestore.collection("spams");

export const getSpamId = (): string => spamsRef.doc().id;

export const fetchSpam = async (spamId: string): Promise<Spam | undefined> =>
  fetchDocument<Spam>(spamsRef.doc(spamId));

export const fetchSpams = async () =>
  fetchCollection(spamsRef.where("isDeleted", "==", false));
