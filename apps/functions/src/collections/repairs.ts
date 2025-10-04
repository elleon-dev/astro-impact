import { firestore } from "../firebase";
import { fetchDocument, setDocument } from "../firebase/firestore";

export const repairsRef = firestore.collection("repairs");

export const getRepairId = (): string => repairsRef.doc().id;

export const addRepair = async (repair: Repair): Promise<void> => {
  await setDocument(repairsRef.doc(repair.id), repair);
};

export const fetchRepair = async (
  repairId: string,
): Promise<Repair | undefined> =>
  fetchDocument<Repair>(repairsRef.doc(repairId));
