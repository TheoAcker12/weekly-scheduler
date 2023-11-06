import { Category } from "@/lib/api_schema"
import { GenericError } from "@/lib/types"

export type CategoryState = {
  status: 'loading' | 'awaitingUpdate' | 'default',
  category?: Category,
  errors: GenericError[],
  activeDelete?: number, // -1 for category, >= for field, undefined if nothing set
  nameModified?: boolean,
}
export type CategoryAction =
| {type: 'dataLoaded', category: Category}
| {type: 'dataLoadFailed', error: GenericError}
| {type: 'errorsDismissed'}
| {type: 'update/succeeded'}
| {type: 'update/failed', error: GenericError}
| {type: 'update/requested'} // on blur - update db if category modified
| {type: 'delete/clicked', index: number}
| {type: 'delete/confirmed'}
| {type: 'delete/canceled'}
| {type: 'categoryEdited', value: string}
| {type: 'fieldEdited', index: number, value: string}
| {type: 'fieldsMoved', index1: number, index2: number}

export function categoryReducer(state: CategoryState, action: CategoryAction) {
  switch (action.type) {
    case 'dataLoaded':
      state.category = action.category;
      state.nameModified = false;
      state.status = 'default';
      break;
    case 'dataLoadFailed':
      state.category = undefined;
      state.errors.push(action.error);
      state.status = 'default';
      break;
    case 'errorsDismissed':
      state.errors = [];
      break;
    // data must exist for the following
    default:
      if (!state.category) break;
      switch (action.type) {
        case 'update/succeeded':
          state.status = 'loading'; // reload data to make sure it matches database
          break;
        case 'update/failed':
          state.errors.push(action.error);
          state.category = undefined;
          state.status = 'loading';
          break;
        case 'update/requested':
          state.status = 'awaitingUpdate';
          state.nameModified = false;
          break;
        case 'delete/clicked':
          if (action.index === -1 || state.category.fields[action.index]) state.activeDelete = action.index;
          else {
            state.activeDelete = undefined;
            state.errors = [{msg: 'Delete failed: No field exists at index: ' + action.index}];
          }
          break;
        case 'delete/confirmed':
          // should only be called if a field is being deleted
          if (state.activeDelete === undefined || !state.category.fields[state.activeDelete]) break;
          state.status = 'awaitingUpdate';
          state.category.fields.splice(state.activeDelete, 1);
          state.activeDelete = undefined;
          break;
        case 'delete/canceled':
          state.activeDelete = undefined;
          break;
        case 'categoryEdited':
          state.category.name = action.value;
          state.nameModified = true;
          break;
        case 'fieldEdited':
          if (!state.category.fields[action.index]) break;
          state.category.fields[action.index].name = action.value;
          state.nameModified = true;
          break;
        case 'fieldsMoved': {
          let field1 = state.category.fields[action.index1];
          let field2 = state.category.fields[action.index2];
          // validate indexes
          if (!field1 || !field2) break;
          state.category.fields[action.index1] = {...field2, order: field1.order};
          state.category.fields[action.index2] = {...field1, order: field2.order};
          // wait for database confirmation
          state.status = 'awaitingUpdate';
          break;
        }
      }
  }
}