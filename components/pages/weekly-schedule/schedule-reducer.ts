import { getStartDayIndex } from "@/lib/utils";
import { ParsedUrlQuery } from "querystring"


export type ScheduleState = {
  status: 'routerLoading' | 'default',
  viewType: 'list' | 'table',
  startDayIndex: number,
}

export type ScheduleAction =
| {type: 'routerReady', params: ParsedUrlQuery}
| {type: 'viewTypeSelected', value: 'list' | 'table'}
| {type: 'startDaySelected', value: number}

export function scheduleReducer(state: ScheduleState, action: ScheduleAction): void {
  switch (action.type) {
    case 'routerReady':
      // determine if view type should be switched to table
      if (action.params['view_as'] === 'table') state.viewType = 'table';
      // determine if starting day should use a different index
      state.startDayIndex = getStartDayIndex(action.params['start_on']) ?? state.startDayIndex;
      // change page status
      state.status = 'default';
      break;
    case 'viewTypeSelected':
      state.viewType = action.value;
      break;
    case 'startDaySelected':
      if (!isNaN(action.value)) state.startDayIndex = action.value % 7; // always make sure index is between 0 and 6 inclusive
      break;
  }
}