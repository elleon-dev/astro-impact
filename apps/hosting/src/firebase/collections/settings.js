import { firestore } from "../config";
import { fetchDocumentOnce } from "../utils";

export const settingsRef = firestore.collection("settings");
export const getSettingId = () => settingsRef.doc().id;
export const fetchSetting = async (id) =>
  fetchDocumentOnce(settingsRef.doc(id));
export const addSetting = (setting) => settingsRef.doc(setting.id).set(setting);
export const updateSetting = (settingId, setting) =>
  settingsRef.doc(settingId).update(setting);
