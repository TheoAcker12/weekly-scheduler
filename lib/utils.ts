import { days } from "./types";

// get the index of maybeDay if it is a Day, otherwise undefined
export function getStartDayIndex(maybeDay: any): number|undefined {
  const index = days.findIndex((day) => day === maybeDay);
  if (index > -1) return index;
  else return undefined;
}