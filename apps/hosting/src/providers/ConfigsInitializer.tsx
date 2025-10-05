import React, { useEffect } from "react";
import { setLocale } from "yup";
import yup from "@/config/yup.json";

import * as dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import es from "dayjs/locale/es";

import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekYear from "dayjs/plugin/weekYear";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

export const ConfigsInitializer = ({ children }) => {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(localizedFormat);
  dayjs.extend(customParseFormat);
  dayjs.extend(advancedFormat);
  dayjs.extend(weekday);
  dayjs.extend(localeData);
  dayjs.extend(weekOfYear);
  dayjs.extend(weekYear);

  dayjs.extend(isSameOrBefore);

  useEffect(() => {
    setLocale(yup["en"]);

    dayjs.locale(es);
  }, []);

  return <>{children}</>;
};
