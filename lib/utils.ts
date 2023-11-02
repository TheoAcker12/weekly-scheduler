import { Category } from "./api_schema";
import { Filter, Param, days } from "./types";

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
// filter params - returns array of filter objects with category and field indexes for each valid filter
export function parseFilterParams(include: boolean, param: Param, categories: Category[]): Filter[] {
  let filters: Filter[] = [];
  if (param === undefined) return filters;
  const unparsedFilters = (typeof param === 'string') ? [param] : param;
  for (const filterParam of unparsedFilters) {
    const filter = parseFilter(include, filterParam, categories);
    if (filter) filters.push(filter);
  }
  return filters;
}
// parses an individual filter param string - must be in format: catId_fieldId-fieldId... with the set of field ids being optional
function parseFilter(include: boolean, filterParam: string, categories: Category[]): Filter|undefined {
  const pieces = filterParam.split('_', 2);
  // validate first piece - must be valid category
  const catId = parseInt(pieces[0]);
  if (isNaN(catId)) return undefined;
  const cat_index = categories.findIndex((cat) => cat.id === catId);
  if (cat_index === -1) return undefined;
  // validate optional second piece and prepare filter
  const filter: Filter = { include, cat_index, field_index_list: []};
  if (pieces.length === 2) {
    const fields = categories[cat_index].fields; // valid options
    // split list of field ids and add any valid ones to the filter
    for (let piece of pieces[1].split('-')) {
      const id = parseInt(piece);
      if (isNaN(id)) continue;
      const index = fields.findIndex((field) => field.id === id);
      if (index > -1) filter.field_index_list.push(index);
    }
  }
  return filter;
}