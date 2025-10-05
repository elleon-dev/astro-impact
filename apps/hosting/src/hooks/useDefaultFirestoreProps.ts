import { assign } from "lodash";
import { firebase } from "../firebase";

interface DocumentCreate {
  createAt: firebase.firestore.Timestamp;
  updateAt: firebase.firestore.Timestamp;
  updateBy: string;
  isDeleted?: false;
}

interface DocumentUpdate {
  updateAt: firebase.firestore.Timestamp;
  updateBy: string;
}

interface DocumentDelete {
  updateAt: firebase.firestore.Timestamp;
  updateBy: string;
  isDeleted?: true;
}

interface Return {
  assignCreateProps: <U>(document: U) => U & DocumentCreate;
  assignDeleteProps: <U>(document: U) => U & DocumentDelete;
  assignUpdateProps: <U>(document: U) => U & DocumentUpdate;
}

export const useDefaultFirestoreProps = (isSoftDelete = true): Return => {
  // assert(authUser, "Missing global user");

  const assignCreateProps = <U>(document: U): U & DocumentCreate => {
    const CREATE: DocumentCreate = {
      createAt: firebase.firestore.Timestamp.now(),
      updateAt: firebase.firestore.Timestamp.now(),
      updateBy: "",
    };

    if (isSoftDelete) CREATE.isDeleted = false;

    return assign({}, document, CREATE);
  };

  const assignUpdateProps = <U>(document: U): U & DocumentUpdate => {
    const UPDATE: DocumentUpdate = {
      updateAt: firebase.firestore.Timestamp.now(),
      updateBy: "",
    };

    return assign({}, document, UPDATE);
  };

  const assignDeleteProps = <U>(document: U): U & DocumentDelete => {
    const DELETE: DocumentDelete = {
      updateAt: firebase.firestore.Timestamp.now(),
      updateBy: "",
    };

    if (isSoftDelete) DELETE.isDeleted = true;

    return assign({}, document, DELETE);
  };

  return {
    assignCreateProps,
    assignUpdateProps,
    assignDeleteProps,
  };
};
