import { ItemListItem } from "@/lib/api_schema"
import { GenericError } from "@/lib/types"

// awaitingUpdate means that the database is being updated - don't want to reload the data until the update is finished, but don't want to let the user make changes until the update is finished, either
export type GridState = {
  status: 'dataLoading' | 'awaitingUpdate' | 'default',
  items?: ItemListItem[],
  errors: GenericError[],
  activeDelete?: number, // for confirming deletion before actually deleting
}

export type GridAction = 
| {type: 'dataLoaded', items: ItemListItem[]}
| {type: 'dataLoadFailed', error: GenericError}
| {type: 'errorsDismissed'}
// updates - called when user initiates an action so that state can immediately reflect their changes for a relatively uninterrupted experience
| {type: 'itemDeleted', index: number}
| {type: 'delete/confirmed'}
| {type: 'delete/canceled'}
| {type: 'itemsMoved', index1: number, index2: number}
// completed updates - called when the action initiated by the user completes
| {type: 'updateFailed', error: GenericError}
| {type: 'updateSucceeded'}

export function gridReducer(state: GridState, action: GridAction) {
  switch (action.type) {
    case 'dataLoaded':
      state.items = action.items;
      state.status = 'default';
      break;
    case 'dataLoadFailed':
      state.items = undefined;
      state.errors.push(action.error);
      state.status = 'default'; // no reason to keep trying to load the data
      break;
    case 'errorsDismissed':
      state.errors = [];
      break;
    default:
      // items must exist for these actions to be called
      if (!state.items) break;
      switch (action.type) {
        case 'itemDeleted':
          // validate index
          if (state.items[action.index]) state.activeDelete = action.index;
          else {
            state.activeDelete = undefined;
            state.errors.push({msg: `Delete failed: No item exists at index: ${action.index}`});
          }
          break;
        case 'delete/confirmed':
          if (state.activeDelete === undefined) break; // activeDelete must be set
          state.items.splice(state.activeDelete, 1);
          state.activeDelete = undefined;
          state.status = 'awaitingUpdate';
          break;
        case 'delete/canceled':
          state.activeDelete = undefined;
          break;
        case 'itemsMoved': {
          // cancel activeDelete when another action is performed
          state.activeDelete = undefined;
          // assign items
          let item1 = state.items[action.index1];
          let item2 = state.items[action.index2];
          // indexes should already be validated, but doesn't hurt to check
          if (!item1 || !item2) break;
          state.items[action.index1] = {...item2, order: item1.order}
          state.items[action.index2] = {...item1, order: item2.order}
          state.status = 'awaitingUpdate';
          break;
        }
        case 'updateFailed':
          state.errors.push(action.error);
          // reload the data since current state likely no longer reflects database
          state.items = undefined;
          state.status = 'dataLoading';
          break;
        case 'updateSucceeded':
          // reload the data, although current state should reflect the database after changes
          state.status = 'dataLoading';
          break;
      }
  }
}