import { assign } from "lodash";
import * as admin from "firebase-admin";
import { firestoreTimestamp } from "../firebase";
// import { Timestamp } from "@google-cloud/firestore";

interface DocumentCreate {
  createAt: admin.firestore.Timestamp;
  updateAt: admin.firestore.Timestamp;
  isDeleted?: false;
}

interface DocumentUpdate {
  updateAt: admin.firestore.Timestamp;
}

interface DocumentDelete {
  updateAt: admin.firestore.Timestamp;
  isDeleted?: true;
}

interface Return {
  assignCreateProps: <U>(document: U) => U & DocumentCreate;
  assignDeleteProps: <U>(document: U) => U & DocumentDelete;
  assignUpdateProps: <U>(document: U) => U & DocumentUpdate;
}

export const defaultFirestoreProps = (isSoftDelete = true): Return => {
  const assignCreateProps = <U>(document: U): U & DocumentCreate => {
    const CREATE: DocumentCreate = {
      createAt: firestoreTimestamp.now(),
      updateAt: firestoreTimestamp.now(),
    };

    if (isSoftDelete) CREATE.isDeleted = false;

    return assign({}, document, CREATE);
  };

  const assignUpdateProps = <U>(document: U): U & DocumentUpdate => {
    const UPDATE: DocumentUpdate = {
      updateAt: firestoreTimestamp.now(),
    };

    return assign({}, document, UPDATE);
  };

  const assignDeleteProps = <U>(document: U): U & DocumentDelete => {
    const DELETE: DocumentDelete = {
      updateAt: firestoreTimestamp.now(),
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
