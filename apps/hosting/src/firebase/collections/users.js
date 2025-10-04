import { firestore } from "../config";
import { fetchCollectionOnce, fetchDocumentOnce } from "../utils";
import { updateDocument } from "../firestore";

export const usersRef = firestore.collection("users");

export const getUserId = () => usersRef.doc().id;

export const fetchUser = async (id) => fetchDocumentOnce(usersRef.doc(id));

export const fetchUsers = async () =>
  fetchCollectionOnce(usersRef.where("isDeleted", "==", false));

export const updateUser = async (userId, user) =>
  updateDocument(usersRef.doc(userId), user);

export const fetchUsersByDni = async (dni) =>
  fetchCollectionOnce(
    usersRef.where("dni", "==", dni).where("isDeleted", "==", false).limit(1)
  );
