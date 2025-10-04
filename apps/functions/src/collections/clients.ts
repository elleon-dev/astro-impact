import { firestore } from "../firebase";
import { fetchDocument } from "../firebase/firestore";

export const clientsRef = firestore.collection("clients");

export const getClientId = (): string => clientsRef.doc().id;

export const fetchClient = async (
  clientId: string,
): Promise<Client | undefined> =>
  fetchDocument<Client>(clientsRef.doc(clientId));
