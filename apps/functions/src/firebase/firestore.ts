import * as firebase from "firebase-admin";

type Document<T extends ObjectType> = { id: string } & T;

type DocumentData = firebase.firestore.DocumentData;
export type QuerySnapshot = FirebaseFirestore.QuerySnapshot;
export type Query = FirebaseFirestore.Query;
export type DocumentReference = FirebaseFirestore.DocumentReference;
type WriteResult = FirebaseFirestore.WriteResult;

export type WhereClauses<T extends ObjectType> = [
  NestedKeyOf<T>,
  FirebaseFirestore.WhereFilterOp,
  unknown,
];

export const now = () => firebase.firestore.Timestamp.now();

interface ToTimestamp {
  seconds: number;
  nanoseconds: number;
}

export const toTimestamp = ({
  seconds,
  nanoseconds,
}: ToTimestamp): firebase.firestore.Timestamp =>
  new firebase.firestore.Timestamp(seconds, nanoseconds);

export const querySnapshotToArray = <T extends ObjectType>(
  querySnapshot: QuerySnapshot,
): Document<T>[] => {
  const documents: Document<T>[] = [];

  querySnapshot.forEach((documentSnapshot) => {
    const document = documentSnapshot.data() as T;
    documents.push({ ...document, id: documentSnapshot.id });
  });

  return documents;
};

export const documentSnapshotToDocument = <T extends ObjectType>(
  docSnapshot: FirebaseFirestore.DocumentSnapshot,
): T | undefined => {
  const document = docSnapshot as FirebaseFirestore.DocumentSnapshot<T>;

  return document.data();
};

export const fetchCollection = async <T extends ObjectType>(
  query: Query,
  whereClauses?: WhereClauses<T>[],
): Promise<Document<T>[]> => {
  let newQuery = query;

  whereClauses?.forEach(
    ([field, operation, value]) =>
      (newQuery = newQuery.where(field, operation, value)),
  );

  const querySnapshot = await newQuery.get();

  return querySnapshotToArray<T>(querySnapshot);
};

export const fetchCollectionOnce = async <T extends DocumentData>(
  query: Query,
): Promise<Document<T>[]> => {
  const querySnapshot = await query.get();

  return querySnapshotToArray<T>(querySnapshot);
};

export const fetchDocument = async <T extends ObjectType>(
  query: DocumentReference,
): Promise<T | undefined> => {
  const documentSnapshot = await query.get();

  return documentSnapshotToDocument<T>(documentSnapshot);
};

export const setDocument = async <T extends ObjectType>(
  docRef: DocumentReference,
  document: T,
): Promise<WriteResult> => docRef.set(document);

export const updateDocument = async <T extends ObjectType>(
  docRef: DocumentReference,
  document: T,
): Promise<WriteResult> => docRef.update(document);

export const mergeDocument = async <T extends ObjectType>(
  docRef: DocumentReference,
  document: T,
): Promise<WriteResult> => docRef.set(document, { merge: true });

export const deleteDocument = async (
  docRef: DocumentReference,
): Promise<WriteResult> => docRef.delete();
