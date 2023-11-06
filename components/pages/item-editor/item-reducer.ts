import { Category, Item, Schedule } from "@/lib/api_schema"
import { Day, GenericError, days } from "@/lib/types"

export type ItemState = {
  status: 'loading' | 'awaitingUpdate' | 'default',
  item?: Item,
  categories?: Category[],
  errors: GenericError[],
  activeDelete?: number, // -1 for the item, >= 0 for schedule, undefined if nothing
  currentFieldModified?: boolean, // Becomes true when an editable field is first edited. Then, when field is left (onBlur), an update will be called (because this value is true). Calling that update will reset this field to false.
  activeSchedule?: number,
}
export type DeleteAction =
| {type: 'delete/clicked', index: number}
| {type: 'delete/confirmed'}
| {type: 'delete/canceled'}
export type ItemAction =
| {type: 'itemLoaded', item: Item}
| {type: 'categoriesLoaded', categories: Category[]}
| {type: 'dataLoadFailed', error: GenericError}
| {type: 'errorsDismissed'}
| {type: 'update/succeeded'}
| {type: 'update/failed', error: GenericError}
| {type: 'update/requested'} // on blur, update db if current field modified (also called when new schedule is added)
| DeleteAction
| {type: 'item/nameEdited', value: string}
| {type: 'item/notesEdited', value: string}
| {type: 'item/categoriesEdited', categories: Item['categories']} // todo: not sure if this is how I want to do this
// todo: allow moving schedules?
| {type: 'scheduleEditorSelected', index?: number} // undefined if editor was closed
| {type: 'scheduleAmountEdited', value: string}
| {type: 'scheduleDayEdited', day: Day|'all', value: boolean}
| {type: 'scheduleCategoriesEdited', categories: Item['categories']}

export function itemReducer(state: ItemState, action: ItemAction) {
  switch (action.type) {
    case 'itemLoaded':
      state.item = action.item;
      state.currentFieldModified = false;
      // categories should already be loaded, but doesn't hurt to check
      if (state.categories) state.status = 'default';
      break;
    case 'categoriesLoaded':
      state.categories = action.categories;
      // items shouldn't be loaded yet, so no need to modify status
      break;
    case 'dataLoadFailed':
      state.item = undefined;
      state.errors.push(action.error);
      state.status = 'default';
      break;
    case 'errorsDismissed':
      state.errors = [];
      break;
    // data must exist for the following actions
    default:
      if (!state.item || !state.categories) break;
      switch (action.type) {
        case 'update/succeeded':
          state.status = 'loading'; // reload data to make sure it matches database
          break;
        case 'update/failed':
          state.errors.push(action.error);
          state.item = undefined;
          state.status = 'loading';
          break;
        case 'update/requested':
          state.status = 'awaitingUpdate';
          state.currentFieldModified = false;
          break;
        case 'delete/clicked':
          if (action.index === -1 || state.item.schedules[action.index]) state.activeDelete = action.index;
          else {
            state.activeDelete = undefined;
            state.errors = [{msg: 'Delete failed: No schedule exists at index: ' + action.index}];
          }
          break;
        case 'delete/canceled':
          state.activeDelete = undefined;
          break;
        case 'delete/confirmed':
          // should only be called if a schedule is being deleted
          if (state.activeDelete === undefined || !state.item.schedules[state.activeDelete]) break;
          state.status = 'awaitingUpdate';
          state.item.schedules.splice(state.activeDelete, 1);
          if (state.activeDelete === state.activeSchedule) state.activeSchedule = undefined;
          else if (state.activeSchedule && state.activeDelete < state.activeSchedule) state.activeSchedule--;
          state.activeDelete = undefined;
          break;
        case 'item/nameEdited':
          state.item.name = action.value;
          state.currentFieldModified = true;
          break;
        case 'item/notesEdited':
          state.item.notes = action.value;
          state.currentFieldModified = true;
          break;
        case 'item/categoriesEdited':
          state.item.categories = action.categories;
          state.status = 'awaitingUpdate';
          break;
        case 'scheduleEditorSelected':
          if (action.index && state.item.schedules[action.index]) state.activeSchedule = action.index;
          else state.activeSchedule = undefined;
          break;
        // must have active schedule for the following
        default:
          const index = state.activeSchedule;
          if (!index) break;
          const schedule = state.item.schedules[index];
          if (!schedule) break;
          switch (action.type) {
            case 'scheduleAmountEdited':
              state.item.schedules[index].amount = action.value;
              state.currentFieldModified = true;
              break;
            case 'scheduleCategoriesEdited':
              state.item.schedules[index].categories = action.categories;
              state.status = 'awaitingUpdate';
              break;
            case 'scheduleDayEdited':
              if (action.day === 'all') {
                for (let day of days) {
                  state.item.schedules[index][day] = action.value;
                }
              }
              else state.item.schedules[index][action.day] = action.value;
              state.status = 'awaitingUpdate';
              break;
          }
      }
  }
}