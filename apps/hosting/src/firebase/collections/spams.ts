import { firestore } from "@/firebase";
import { now } from "../utils.ts";

export const spamsRef = firestore.collection("spams");
export const getSpamId = () => spamsRef.doc().id;
export const addSpam = (spam) => spamsRef.doc(spam.id).set(spam);
export const updateSpam = (spamId, spam) => spamsRef.doc(spamId).update(spam);
export const deleteSpam = (spamId) => spamsRef.doc(spamId).delete();

export const addNonExistingSpamsOnly = async (values = [], type, user) => {
  for (const value of values) {
    const querySnapshot = await spamsRef
      .where("type", "==", type)
      .where("value", "==", value)
      .where("isDeleted", "==", false)
      .get();

    if (querySnapshot.empty) {
      await addSpam({
        id: getSpamId(),
        value: value,
        type: type,
        createAt: now(),
        updateAt: now(),
        isDeleted: false,
        ...(user?.email && { updateBy: user.email }),
      });
    }
  }
};
