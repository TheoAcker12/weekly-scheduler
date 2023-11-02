import { Category, ScheduleListItem } from "./api_schema";
import { Day, Filter, Param, ScheduleData, SortedScheduleData, UnsortedScheduleData, dayKeys, days } from "./types";

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

// format, sort, and filter data for weekly schedule
export function formatData(categories: Category[], schedules: ScheduleListItem[], params: {[key: string]: Param}): ScheduleData {
  // parse params
  const sortIndex = parseSortParam(params['sort_by'], categories);
  const include = parseFilterParams(true, params['include'], categories);
  const exclude = parseFilterParams(false, params['exclude'], categories);

  // filter data - check include filters and exclude filters
  let filteredSchedules = filterSchedules(true, include, categories, schedules);
  filteredSchedules = filterSchedules(false, exclude, categories, filteredSchedules);

  // check for sort category - get list of fields (in order) if data is to be sorted
  if (sortIndex !== undefined) {
    const sortFields = getSortFields(sortIndex, [...include, ...exclude], categories);

    // make empty days list and populate each day with sort fields
    const dayMap: SortedScheduleData = dayKeys<SortedScheduleData['Monday']>([]);
    // the above makes all days share the same value, so now let's fix that
    for (let day of days) {
      dayMap[day] = sortFields.map((field) => ({name: field.name, items: []}));
    }

    // for convenience, map field id to index in sortFields
    const fieldIndex = sortFields.reduce<{[key: number]: number}>((o, field, index) => {
      o[field.id] = index;
      return o;
    }, {});

    // loop through schedules
    for (const schedule of filteredSchedules) {
      // loop through schedule categories/fields to determine where to place the schedule (could be multiple places, could be nowhere)
      for (const category of schedule.categories) {
        if (category.id in fieldIndex) {
          // loop through days - if day matches, add schedule to day (at the appropriate index)
          for (const day of days) {
            if (schedule[day]) dayMap[day][fieldIndex[category.id]].items.push({
              name: schedule.item.name,
              amount: schedule.amount,
              notes: schedule.item.notes,
            });
          }
        }
      }
    }
    // return data
    return {sorted: true, dayMap};
  } else {
    // unsorted data
    // make empty days list - basic data structure
    const dayMap: UnsortedScheduleData = dayKeys<[]>([]);
    // the above makes all days share the same value, so now let's fix that
    for (let day of days) {
      dayMap[day] = [];
    }

    // loop through schedules
    for (const schedule of filteredSchedules) {
      // loop through days - if day matches, add schedule to day
      for (const day of days) {
        if (schedule[day]) dayMap[day].push({
          name: schedule.item.name,
          amount: schedule.amount,
          notes: schedule.item.notes,
        });
      }
    }
    return {sorted: false, dayMap};
  }
}
// some helper functions for the above
function filterSchedules(include: boolean, filters: Filter[], categories: Category[], schedules: ScheduleListItem[]): ScheduleListItem[] {
  // must be at least one filter for this to matter
  if (filters.length === 0) return schedules;
  return schedules.filter((s) => {
    // if include, as soon as a match is found the schedule is valid; if exclude, as soon as a match is found the schedule is invalid
    let valid = !include; // assumed invalid until found (if include); assumed valid until found (if exclude)
    for (let filter of filters) {
      // get list of all valid field ids for the category (map field index to field id) - if no ids are specified then use all
      const category = categories[filter.cat_index];
      const field_ids = filter.field_index_list.length ? filter.field_index_list.map((index) => category.fields[index].id) : category.fields.map((f) => f.id);
      // check if at least one field id matches
      const found = !!s.categories.find((field) => field_ids.includes(field.id));
      if (found) {
        valid = include;
        break; // no need to continue once any match has been found
      }
    }
    return valid;
  });
}
function getSortFields(sortIndex: number, filters: Filter[], categories: Category[]): Category['fields'] {
  const fields = categories[sortIndex].fields;
  // check if also filtering by this category
  const filter = filters.find((f) => f.cat_index === sortIndex);
  // if not filtering by the same category, use all fields
  if (!filter) return fields;
  // if filtering, only include the fields included/not excluded by the filter
  const filteredFields = fields.filter((field, index) => filter.field_index_list.includes(index) === filter.include);
  // filtering only matters if at least one field id is specified by filter - in other words, if filtering removed all fields, ignore the filtering and return all fields
  if (!filteredFields.length) return fields;
  return filteredFields;
}

// modify days list based on user preferences
export function getOrderedDays(startIndex: number): Day[] {
  let newDays: Day[] = [];
  for (let i = 0; i < 7; i++) {
    const index = (startIndex + i) % 7;
    newDays.push(days[index]);
  }
  return newDays;
}