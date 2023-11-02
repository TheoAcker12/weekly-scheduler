import { Category } from "@/lib/api_schema";
import { GenericError, ScheduleData } from "@/lib/types";
import { getStartDayIndex } from "@/lib/utils";
import { ParsedUrlQuery } from "querystring"


export type ScheduleState = {
  status: 'routerLoading' | 'dataLoading' | 'default',
  viewType: 'list' | 'table',
  startDayIndex: number,
  categories?: Category[],
  data?: ScheduleData,
  error?: GenericError,
  params: ParsedUrlQuery,
}

export type ScheduleAction =
| {type: 'routerReady', params: ParsedUrlQuery}
| {type: 'categoriesLoaded', categories: Category[]}
| {type: 'dataLoaded', data: ScheduleData}
| {type: 'dataLoadFailed', error?: GenericError}
| {type: 'viewTypeSelected', value: 'list' | 'table'}
| {type: 'startDaySelected', value: number}
| {type: 'paramsModified', params: ParsedUrlQuery}

export function scheduleReducer(state: ScheduleState, action: ScheduleAction): void {
  switch (action.type) {
    case 'routerReady':
      state.params = action.params;
      // determine if view type should be switched to table
      if (action.params['view_as'] === 'table') state.viewType = 'table';
      // determine if starting day should use a different index
      state.startDayIndex = getStartDayIndex(action.params['start_on']) ?? state.startDayIndex;
      // change page status - next step is loading data
      state.data = undefined;
      state.status = 'dataLoading';
      break;
    case 'categoriesLoaded':
      state.categories = action.categories;
      // don't update status if data still needs to be loaded
      if (state.data) state.status = 'default';
      break;
    case 'dataLoaded':
      state.data = action.data;
      // don't update status if categories still need to be loaded (data always comes after categories, but it never hurts to be safe)
      if (state.categories) state.status = 'default';
      break;
    case 'dataLoadFailed':
      state.error = action.error;
      state.status = 'default'; // tells the page not to try getting data
      break;
    case 'viewTypeSelected':
      state.viewType = action.value;
      break;
    case 'startDaySelected':
      if (!isNaN(action.value)) state.startDayIndex = action.value % 7; // always make sure index is between 0 and 6 inclusive
      break;
    case 'paramsModified':
      // will need to re-fetch data to match the new params
      state.data = undefined; // no need to re-fetch categories, though
      state.params = action.params;
      state.status = 'dataLoading'; // tells the page to try getting data again
      break;
  }
}