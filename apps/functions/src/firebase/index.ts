import * as admin from "firebase-admin";

admin.initializeApp();

export const firestore = admin.firestore();
export const storage = admin.storage();
export const auth = admin.auth();

firestore.settings({ ignoreUndefinedProperties: true });

export const firestoreTimestamp = admin.firestore.Timestamp;
export const firestoreFieldValue = admin.firestore.FieldValue;
