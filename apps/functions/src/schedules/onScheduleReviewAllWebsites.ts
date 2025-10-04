// import { logger } from "../utils/logger";
// import { sendMailReviewAllWebsites } from "../mailer";
// import {
//   fetchSetting,
//   fetchWebs,
//   updateSetting,
//   updateWeb,
// } from "../collections";
// import { checkWebsite } from "../api/review-website/checkWebsites";
// import assert from "assert";
// import type { OnSchedule } from "./interface";
// import { defaultFirestoreProps } from "../utils";
//
// export const onScheduleReviewAllWebsites: OnSchedule = async () => {
//   logger.log("「Verified all Websites - by schedule」Initialize");
//
//   try {
//     await onReviewAllWebsites();
//   } catch (e) {
//     logger.error(e);
//   }
// };
//
// const onReviewAllWebsites = async (): Promise<void> => {
//   const { assignUpdateProps } = defaultFirestoreProps();
//
//   const websites = await fetchWebs();
//   assert(websites, "websites missing!");
//
//   logger.log("websites: ", websites);
//
//   for (const web of websites) {
//     const resultCheckWebsite = await checkWebsite(web.url);
//     await updateWeb(
//       web.id,
//       assignUpdateProps({ ...web, status: resultCheckWebsite }),
//     );
//   }
//
//   const settings = await fetchSetting("default");
//   assert(settings, "settings missing!");
//
//   await updateSetting("default", {
//     reviewAllWebsites: {
//       ...settings?.reviewAllWebsites,
//       count: 0,
//     },
//   });
//
//   const _websites = await fetchWebs();
//   assert(_websites, "_websites missing!");
//
//   await sendMailReviewAllWebsites({ websites: _websites, settings });
// };
