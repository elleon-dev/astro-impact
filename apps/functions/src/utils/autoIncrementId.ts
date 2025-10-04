// import { firestore } from "../config/firebase";
// import { toString } from "lodash";
//
// interface SettingCommon {
//   saleId?: number;
// }
//
// const DEFAULT_PURCHASE_NUMBER = 0;
//
// export const newSaleId = async (): Promise<string> =>
//   firestore.runTransaction(async (transaction) => {
//     const settingRef = firestore.doc("settings/common");
//
//     const commonSnapshot = await transaction.get(settingRef);
//
//     const common = commonSnapshot.data() as SettingCommon | undefined;
//
//     const saleId =
//       commonSnapshot.exists && common?.saleId
//         ? common.saleId
//         : DEFAULT_PURCHASE_NUMBER;
//
//     const newSaleId: number = saleId > 999999000 ? 1 : saleId + 1;
//
//     transaction.set(settingRef, { saleId: newSaleId }, { merge: true });
//
//     return toString(newSaleId).padStart(9, "0");
//   });
