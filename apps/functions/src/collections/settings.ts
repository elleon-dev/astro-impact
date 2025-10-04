import { firestore } from "../firebase";
import { fetchCollection, fetchDocument } from "../firebase/firestore";

export const settingsRef = firestore.collection("settings");

export const getSettingId = (): string => settingsRef.doc().id;

export const fetchSetting = async (
  settingId: string,
): Promise<Setting | undefined> =>
  fetchDocument<Setting>(settingsRef.doc(settingId));

export const fetchSettings = async (): Promise<Setting[] | undefined> =>
  fetchCollection(settingsRef.where("isDeleted", "==", false));

export const updateSetting = (settingId: string, setting: Partial<Setting>) =>
  settingsRef.doc(settingId).update(setting);
