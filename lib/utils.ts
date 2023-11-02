import { Category } from "./api_schema";
import { Param, days } from "./types";

// get the index of maybeDay if it is a Day, otherwise undefined
export function getStartDayIndex(maybeDay: any): number|undefined {
  const index = days.findIndex((day) => day === maybeDay);
  if (index > -1) return index;
  else return undefined;
}

// take sort/filter params and parse them into actual values as they will be stored
// sort param - returns index of the sorting category if sort_by is valid
export function parseSortParam(sortBy: Param, categories: Category[]): number|undefined {
  if (typeof sortBy !== 'string') return undefined;
  const sortId = parseInt(sortBy);
  if (isNaN(sortId)) return undefined; // must be valid number
  // check if sortId is a valid category id by finding the index of the category it refers to
  const index = categories.findIndex((cat) => cat.id === sortId);
  if (index > -1) return index;
  else return undefined;
}