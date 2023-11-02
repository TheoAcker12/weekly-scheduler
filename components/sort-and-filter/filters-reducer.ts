import { Category } from "@/lib/api_schema"
import { Filter } from "@/lib/types";

export type FilterState = {
  sortIndex?: number,
  filters: Filter[],
  filtersExpanded: boolean,
}

export type FilterAction =
| {type: 'form/sortCategorySelected', value: string, categories: Category[]}
| {type: 'form/filtersToggled'}
| {type: 'form/filterAdded'}
| {type: 'form/filterDeleted', index: number}
| {type: 'form/filtersCleared'}
| {type: 'filter/includeSelected', index: number, value: string}
| {type: 'filter/categorySelected', index: number, value: string, categories: Category[]}
| {type: 'filter/fieldSelected', index: number, value: string, categories: Category[]}

export function filterReducer(state: FilterState, action: FilterAction): void {
  switch (action.type) {
    case 'form/sortCategorySelected': {
      // validate category index
      const index = parseInt(action.value);
      if (isNaN(index) || !action.categories[index]) state.sortIndex = undefined;
      else state.sortIndex = index;
      break;
    }
    case 'form/filtersToggled':
      // must have filters to toggle
      if (state.filters.length) state.filtersExpanded = !state.filtersExpanded;
      else state.filtersExpanded = false;
      break;
    case 'form/filterAdded':
      state.filters.push({include: true, cat_index: -1, field_index_list: []});
      state.filtersExpanded = true;
      break;
    case 'form/filterDeleted':
      if (state.filters[action.index]) state.filters.splice(action.index, 1);
      if (!state.filters.length) state.filtersExpanded = false;
      break;
    case 'form/filtersCleared':
      state.filters = [];
      state.filtersExpanded = false;
      break;
    default:
      // filter index required for all other actions
      const index = action.index;
      if (!state.filters[index]) break;
      switch (action.type) {
        case 'filter/includeSelected':
          state.filters[index].include = action.value === 'include';
          break;
        case 'filter/categorySelected': {
          // validate category index
          const cat_index = parseInt(action.value);
          if (isNaN(cat_index) || !action.categories[cat_index]) {
            state.filters[index].cat_index = -1;
            // cannot have any fields set because no valid category to select fields from
            state.filters[index].field_index_list = [];
          }
          else if (cat_index !== state.filters[index].cat_index) {
            state.filters[index].cat_index = cat_index;
            // reset fields because a new category has been selected
            state.filters[index].field_index_list = [];
          }
          break;
        }
        case 'filter/fieldSelected': {
          const filter = state.filters[index];
          if (filter.cat_index === -1) break; // must have valid category set
          // handle valid options
          const category = action.categories[filter.cat_index];
          switch (action.value) {
            case 'addAllFields':
              state.filters[index].field_index_list = Array.from(category.fields.keys());
              break;
            case 'clearAllFields':
              state.filters[index].field_index_list = [];
              break;
            default:
              // validate field index
              const field_index = parseInt(action.value);
              if (isNaN(field_index) || !category.fields[field_index]) break;
              // field should be included if it was already in the list or if it is the selected field, but not both (i.e. if the selected field is already in the list, remove it)
              state.filters[index].field_index_list = Array.from(category.fields.keys()).filter((i) => (filter.field_index_list.includes(i)) !== (i === field_index));
              break;
          }
          break;
        }
      }
  }
}