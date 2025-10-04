import { firestore } from "../firebase";
import { fetchCollection, fetchDocument } from "../firebase/firestore";

export const websRef = firestore.collection("webs");

export const getWebId = (): string => websRef.doc().id;

export const fetchWeb = async (webId: string): Promise<Web | undefined> =>
  fetchDocument<Web>(websRef.doc(webId));

export const fetchWebs = async (): Promise<Web[] | undefined> =>
  fetchCollection(websRef.where("isDeleted", "==", false));

export const updateWeb = (webId: string, web: Partial<Web>) =>
  websRef.doc(webId).update(web);
