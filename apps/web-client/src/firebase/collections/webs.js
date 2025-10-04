import { firestore } from "../config";
import { fetchCollectionOnce, fetchDocumentOnce, now } from "../utils";
import { newUrl } from "../../utils";

export const websRef = firestore.collection("webs");
export const getWebId = () => websRef.doc().id;

export const fetchWeb = async (id) => fetchDocumentOnce(websRef.doc(id));

export const fetchWebs = async () =>
  fetchCollectionOnce(websRef.where("isDeleted", "==", false));

export const addWeb = (web) => websRef.doc(web.id).set(web);
export const updateWeb = (id, web) => websRef.doc(id).update(web);
export const deleteWeb = (id) => websRef.doc(id).delete();

export const addOnlyNonExistingWebsites = async (urls = [], user) => {
  for (const url of urls) {
    const _url = newUrl(url).origin;

    const querySnapshot = await websRef.where("url", "==", _url).get();

    if (querySnapshot.empty) {
      await addWeb({
        id: getWebId(),
        url: _url,
        status: "not_reviewed",
        createAt: now(),
        updateAt: now(),
        isDeleted: false,
        ...(user?.email && { updateBy: user.email }),
      });
    }
  }
};
