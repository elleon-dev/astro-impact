import moment from "moment";

export const timeFormat = (millisecondsDiff: number): string => {
  let time = "";

  const daysDiff = moment.duration(millisecondsDiff).days();
  const hoursDiff = moment.duration(millisecondsDiff).hours();
  const minutesDiff = moment.duration(millisecondsDiff).minutes();

  if (minutesDiff > 0) time = `${minutesDiff}m`;
  if (hoursDiff > 0) time = `${hoursDiff}h ${time}`;
  if (daysDiff > 0) time = `${daysDiff}d ${time}`;

  return time;
};
