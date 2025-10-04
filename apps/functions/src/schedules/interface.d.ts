// https://crontab.guru/

import schedulerV2 = require("firebase-functions/v2/scheduler");

export type OnSchedule = (
  event: schedulerV2.ScheduledEvent,
) => void | Promise<void>;
