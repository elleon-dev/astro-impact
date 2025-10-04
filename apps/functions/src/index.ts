import "moment-timezone";
import { app } from "./api";
import functionsHttps = require("firebase-functions/v2/https");
// import functionScheduler = require("firebase-functions/v2/scheduler");
// import { isProduction } from "./config";

type HttpsOptions = functionsHttps.HttpsOptions;
// type ScheduleOptions = functionScheduler.ScheduleOptions;

const httpsOptions = (httpsOptions?: Partial<HttpsOptions>): HttpsOptions => ({
  timeoutSeconds: 540,
  memory: "1GiB",
  maxInstances: 10,
  ...httpsOptions,
});

// const scheduleOptions = (
//   schedule: string,
//   options?: Partial<ScheduleOptions>,
// ): ScheduleOptions => ({
//   schedule: isProduction ? schedule : "0 1 * * *",
//   memory: "256MiB",
//   timeoutSeconds: 540,
//   timeZone: "America/Lima",
//   ...options,
// });

exports.api = functionsHttps.onRequest(httpsOptions(), app);

// exports.onScheduleReviewAllWebsites = functionScheduler.onSchedule(
//   scheduleOptions("0 3 * * *"),
//   onScheduleReviewAllWebsites,
// );
