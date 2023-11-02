import { Category } from "@/lib/api_schema"

export type FilterState = {
  sortIndex?: number,
}

export type FilterAction =
| {type: 'form/sortCategorySelected', value: string, categories: Category[]}

export function filterReducer(state: FilterState, action: FilterAction): void {
  switch (action.type) {
    case 'form/sortCategorySelected': {
      // validate category index
      const index = parseInt(action.value);
      if (isNaN(index) || !action.categories[index]) state.sortIndex = undefined;
      else state.sortIndex = index;
      break;
    }
  }
}