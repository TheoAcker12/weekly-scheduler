import { Category } from "@/lib/api_schema"
import { GenericError } from "@/lib/types"


export type CategoryState = {
  categories?: Category[],
  status: 'loading' | 'awaitingUpdate' | 'default',
  errors: GenericError[],
  activeDelete?: number,
  newCat?: string,
}

export type CategoryAction =
// basic data actions
| {type: 'dataLoaded', categories: Category[]}
| {type: 'dataLoadFailed', error: GenericError}
| {type: 'errorsDismissed'}
// update - can delete categories
| {type: 'delete/clicked', index: number}
| {type: 'delete/confirmed'}
| {type: 'delete/canceled'}
// completed updates - called when the action initiated by the user completes
| {type: 'updateSucceeded'}
| {type: 'updateFailed', error: GenericError}
// adding new category
| {type: 'newCatEdited', name: string}
| {type: 'newCatAdded'}

export function categoryReducer(state: CategoryState, action: CategoryAction): void {
  switch (action.type) {
    case 'dataLoaded':
      state.categories = action.categories;
      state.status = 'default';
      break;
    case 'dataLoadFailed':
      state.categories = undefined; // in case they weren't already
      state.errors.push(action.error);
      state.status = 'default';
      break;
    case 'errorsDismissed':
      state.errors = [];
      break;
    case 'updateSucceeded':
      state.errors = []; // best to clear any errors still remaining
      state.status = 'loading';
      break;
    case 'updateFailed':
      state.errors.push(action.error);
      // reset data
      state.categories = undefined;
      state.status = 'loading';
      break;
    // categories must exist for these actions to be called
    default:
      if (!state.categories) break;
      switch (action.type) {
        case 'delete/clicked':
          if (state.categories[action.index]) state.activeDelete = action.index;
          else {
            state.activeDelete = undefined;
            state.errors = [{msg: `Delete failed: No category exists at index: ${action.index}`}];
          }
          break;
        case 'delete/canceled':
          state.activeDelete = undefined;
          break;
        case 'delete/confirmed':
          if (state.activeDelete === undefined) break;
          state.status = 'awaitingUpdate';
          state.categories = undefined;
          state.activeDelete = undefined;
          break;
        case 'newCatEdited':
          state.newCat = action.name;
          break;
        case 'newCatAdded':
          if (!state.newCat || !state.newCat.trim()) {
            state.errors = [{id: 'new-cat-input', msg: 'Category name must not be empty'}];
          } else {
            state.newCat = '';
            state.categories = undefined;
            state.status = 'awaitingUpdate';
          }
          break;
      }
  }
}